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
  deleteUser,
};
