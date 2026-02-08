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

  // 2. Check if a provider is already using this cuisine name (Optional - you can keep or remove this)
  // If you want multiple providers to request "Burger", you should REMOVE this check.
  // If you want "Burger" to be unique to one person forever, keep it. 
  // (Usually, for requests, you might want to allow duplicates until Admin assigns them).
  if (payload.role === "PROVIDER" && payload.cuisine) {
    const existingProvider = await prisma.providerProfile.findFirst({
      where: {
        cuisineType: payload.cuisine,
      },
    });

    if (existingProvider) {
      throw new Error(
        `A Provider already exists with this cuisine request '${payload.cuisine}'. Try a different one.`
      );
    }
  }

  // 3. Hash the Password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // 4. Create User + Pending Profile
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,

      // Create Profile Nested (Only if role is PROVIDER)
      providerProfile:
        payload.role === "PROVIDER"
          ? {
              create: {
                // 🟢 SAVE THE REQUEST TEXT
                cuisineType: payload.cuisine, 
                restaurantName: payload.name,
                phone: "N/A", 
                address: "N/A",
                status: "PENDING", 
                categoryId: null, 
              },
            }
          : undefined,
    },
  });

  // 5. Return result
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
