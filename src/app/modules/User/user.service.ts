import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { any, string } from "zod";

const createUserIntoDB = async (data: User) => {
  const result = await prisma.user.create({
    data,
  });
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany();
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
  deleteUser,
};
