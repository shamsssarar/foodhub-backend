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

  // 2. Hash the Password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const { cuisine, ...userData } = payload;

  // 4. Create User safely
  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,

      // 5. Create Provider Profile (Only if role is PROVIDER)
      providerProfile:
        userData.role === "PROVIDER"
          ? {
              create: {
                // Map the frontend 'cuisine' to database 'cuisineType'
                cuisineType: cuisine,
              } as any,
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
