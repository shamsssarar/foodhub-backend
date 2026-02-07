import { Meal } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createMealIntoDB = async (userId: string, payload: any) => {
  // 1. Find the Provider Profile to get their ID and Category
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: userId }, // 🟢 Find profile by User ID
  });

  if (!provider) {
    throw new Error("Provider profile not found. Are you registered?");
  }

  if (!provider.categoryId) {
    throw new Error("This provider does not have a category assigned!");
  }

  // 2. Create the Meal using the Provider's stored details
  const result = await prisma.meal.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: Number(payload.price), // Ensure it's a number
      imageUrl: payload.imageUrl,
      
      // 🟢 AUTOMATICALLY LINK THEM:
      providerId: provider.id,      // Use the ID from the profile
      categoryId: provider.categoryId // Use the Category from the profile
    },
  });

  return result;
};

const getAllMealsFromDB = async () => {
  const approvedProviders = await prisma.providerProfile.findMany({
    where: { status: "APPROVED" },
    select: { cuisineType: true },
  });
  const approvedCuisines = approvedProviders
    .map((p) => p.cuisineType)
    .filter((type) => type !== null) as string[];

  const result = await prisma.meal.findMany({
    where: {
      category: {
        name: { in: approvedCuisines },
      },
    },
    include: {
      category: true,
    },
  });
  return result;
};

export const MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
};
