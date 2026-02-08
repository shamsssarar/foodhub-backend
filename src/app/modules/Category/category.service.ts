import { Category } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createCategoryIntoDB = async (data: Category) => {
  const formattedName =
    data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();
  // 🟢 1. Check if category already exists (Case Insensitive)
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: formattedName,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new Error(`Category '${formattedName}' already exists!`);
  }

  // 🟢 2. If not exists, create it
  const result = await prisma.category.create({
    data: {
      ...data,
      name: formattedName,
    },
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
