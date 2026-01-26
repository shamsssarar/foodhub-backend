import { Food } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createFoodIntoDB = async (data: Food) => {
  const result = await prisma.food.create({
    data,
  });
  return result;
};

const getAllFoodsFromDB = async () => {
  const result = await prisma.food.findMany({
    include: {
      category: true, // This is magic: It will fetch the Category details too!
    },
  });
  return result;
};

export const FoodService = {
  createFoodIntoDB,
  getAllFoodsFromDB,
};