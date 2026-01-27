import { Meal } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createMealIntoDB = async (data: Meal) => {
  const result = await prisma.meal.create({
    data,
  });
  return result;
};

const getAllMealsFromDB = async () => {
  const result = await prisma.meal.findMany({
    include: {
      category: true, // This is magic: It will fetch the Category details too!
    },
  });
  return result;
};

export const MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
};