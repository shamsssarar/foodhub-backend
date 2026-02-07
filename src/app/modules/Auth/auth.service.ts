import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { User } from "@prisma/client";
import config from "../../../config";

// REGISTER
// Change payload type to 'any' to avoid TS errors during this quick fix
const registerUser = async (payload: any) => {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error("Email already exists!");
  }

  if (payload.role === "PROVIDER" && payload.cuisine) {
    const existingProvider = await prisma.providerProfile.findFirst({
      where: {
        cuisineType: payload.cuisine, // Checks if 'Burger' is already taken
      },
    });

    if (existingProvider) {
      // 🛑 STOP HERE and return the specific error you wanted
      throw new Error(
        `A Provider already exists with this cuisineType '${payload.cuisine}'. Try a different one.`,
      );
    }
  }

  // 2. Hash the Password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  let categoryId = null;

  if (payload.role === "PROVIDER" && payload.cuisine) {
    const cleanName = payload.cuisine.trim(); // Remove invisible spaces

    // A. Find the Category ID (Case Insensitive)
    let category = await prisma.category.findFirst({
      where: {
        name: { equals: cleanName, mode: "insensitive" },
      },
    });

    // B. If not found, CREATE IT automatically
    if (!category) {
      console.log(`Creating new category: ${cleanName}`);
      category = await prisma.category.create({
        data: { name: cleanName },
      });
    }

    categoryId = category.id; // Now we have the ID!
  }

  // 5. Create User + Link Profile Safely
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,

      // Create Profile Nested
      providerProfile:
        payload.role === "PROVIDER"
          ? {
              create: {
                cuisineType: payload.cuisine || "general",
                restaurantName: payload.name,
                phone: "N/A", // Default value to prevent errors
                address: "N/A",

                // 🟢 LINK THE FOUND ID HERE
                categoryId: categoryId,
              },
            }
          : undefined,
    },
  });

  // 6. Return result
  const { password, ...result } = newUser;
  return result;
};

// LOGIN
const createToken = (
  payload: { userId: string; role: string },
  secret: Secret,
  expiresIn: number,
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as number,
  };
  return jwt.sign(payload, secret as Secret, options);
};

// --- Login User Function ---
const loginUser = async (payload: { email: string; password: string }) => {
  // 1. Find User

  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new Error("User does not exist");
  }

  // 2. Check if Blocked
  if (userData.status === "BLOCKED") {
    throw new Error("User is blocked!");
  }

  // 3. Check Password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    userData.password,
  );
  if (!isPasswordMatched) {
    throw new Error("Password incorrect!");
  }

  // 4. Create Tokens
  const jwtPayload = {
    userId: userData.id,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as any,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as any,
  );

  // 5. Return Data
  return {
    accessToken,
    refreshToken,
    needsPasswordChange: false,
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    },
  };
};

const logoutUser = async () => {
  return {
    success: true,
    message: "Logged out successfully",
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  logoutUser,
};
