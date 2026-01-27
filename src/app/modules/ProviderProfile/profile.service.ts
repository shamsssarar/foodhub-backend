import { ProviderProfile } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createOrUpdateProfile = async (data: ProviderProfile) => {
  // Check if profile already exists for this user
  const isExist = await prisma.providerProfile.findUnique({
    where: {
      userId: data.userId
    }
  });

  if (isExist) {
    // If exists, UPDATE it
    const result = await prisma.providerProfile.update({
      where: { userId: data.userId },
      data,
    });
    return result;
  } else {
    // If not, CREATE it
    const result = await prisma.providerProfile.create({
      data,
    });
    return result;
  }
};

const getProfile = async (userId: string) => {
  const result = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { user: true } // Get the User details (email/name) too
  });
  return result;
};

export const ProfileService = {
  createOrUpdateProfile,
  getProfile,
};