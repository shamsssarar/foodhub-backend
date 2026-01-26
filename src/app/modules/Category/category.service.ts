import { Category } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createCategoryIntoDB = async (data: Category) => {
  const result = await prisma.category.create({
    data,
  });
  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany();
  return result;
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
};