import { Meal } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createMealIntoDB = async (data: Meal) => {
  const result = await prisma.meal.create({
    data,
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
