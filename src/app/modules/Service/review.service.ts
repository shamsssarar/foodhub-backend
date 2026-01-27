import { Review } from "@prisma/client";
import prisma from "../../../shared/prisma";

const addReview = async (data: Review) => {
  const result = await prisma.review.create({
    data,
  });
  return result;
};

export const ReviewService = {
  addReview,
};
