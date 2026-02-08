import { ProviderStatus, User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { any, string } from "zod";

const createUserIntoDB = async (data: User) => {
  const result = await prisma.user.create({
    data,
  });
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    include: {
      providerProfile: true,
    },
  });

  return result;
};

const updateProviderStatus = async (
  providerId: string,
  status: ProviderStatus,
) => {
  const result = await prisma.providerProfile.update({
    where: { userId: providerId },
    data: { status },
  });
  return result;
};

const getMyProviderProfile = async (userId: string) => {
  const result = await prisma.providerProfile.findUnique({
    where: {
      userId: userId, // Find profile where userId matches the token
    },
  });
  
  if (!result) {
    throw new Error("Profile not found");
  }
  
  return result;
};


const assignCategoryToProvider = async (userId: string, categoryId: string) => {
  // 1. Find the Category to make sure it exists (and get its name)
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) throw new Error("Category not found");

  // 2. Update the Provider Profile
  const result = await prisma.providerProfile.update({
    where: { userId: userId },
    data: {
      categoryId: category.id,      // Link the ID
      cuisineType: category.name,   // Update text to match official Name
      status: "APPROVED",           // Auto-approve them!
    },
  });

  return result;
};


const deleteUser = async (id: string) => {
  const result = await prisma.user.delete({
    where: { id },
  });
  return result;
};

export const UserService = {
  createUserIntoDB,
  getAllUsersFromDB,
  updateProviderStatus,
  getMyProviderProfile,
  assignCategoryToProvider,
  deleteUser,
};
