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
      providerId: provider.id, // Use the ID from the profile
      categoryId: provider.categoryId, // Use the Category from the profile
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
      isDeleted: false,
    },
    include: {
      category: true,
    },
  });
  return result;
};

const getMyMeals = async (userId: string) => {
  // 1. Find who you are (Provider)
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: userId },
  });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  // 2. Find meals strictly linked to Provider ID
  const result = await prisma.meal.findMany({
    where: {
      providerId: provider.id,
      isDeleted: false,
    },
  });

  return result;
};

const deleteMyMeal = async (mealId: string, userId: string) => {
  // 1. Find the Provider Profile of the logged-in user
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: userId },
  });

  if (!provider) {
    throw new Error("Provider profile not found.");
  }

  // 2. Check if the meal exists AND belongs to this provider
  // This prevents Provider A from deleting Provider B's food.
  const existingMeal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      providerId: provider.id,
    },
  });

  if (!existingMeal) {
    throw new Error(
      "Meal not found or you do not have permission to delete it.",
    );
  }

  // 3. Delete the Meal
  const result = await prisma.meal.update({
    where: { id: mealId },
    data: { isDeleted: true },
  });

  return result;
};

export const MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
  getMyMeals,
  deleteMyMeal,
};
