import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";

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

export const UserService = {
  createUserIntoDB,
  getAllUsersFromDB,
};
