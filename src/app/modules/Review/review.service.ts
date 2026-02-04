import prisma from "../../../shared/prisma";
import { Review } from "@prisma/client";

const createReview = async (userId: string, payload: any) => {
  console.log("🛠 Service received:", { userId, ...payload });

  // 1. Explicitly Cast Types (Safety Net)
  const formattedData = {
    userId: userId,
    mealId: payload.mealId,

    // 🟢 NEW: You MUST add this line now!
    orderId: payload.orderId,

    rating: Number(payload.rating),
    comment: payload.comment || "",
  };

  // 2. Create in DB
  const result = await prisma.review.create({
    data: formattedData,
  });

  return result;
};

export const ReviewService = {
  createReview,
};
