import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../shared/prisma';
import { User } from '@prisma/client';

// REGISTER
const registerUser = async (payload: User) => {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error('Email already exists!');
  }

  // 2. Hash the Password (Security)
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // 3. Create User
  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  // 4. Return user info WITHOUT the password
  const { password, ...result } = newUser;
  return result;
};

// LOGIN
const loginUser = async (payload: { email: string; password: string }) => {
  // 1. Find User
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error('User does not exist');
  }

  // 2. Check if Blocked
  if (user.status === 'BLOCKED') {
    throw new Error('User is blocked!');
  }

  // 3. Verify Password
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new Error('Password incorrect');
  }

  // 4. Generate Access Token (The "ID Card")
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret', // Ideally use .env
    { expiresIn: '10d' }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};