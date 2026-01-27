import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { error } from "node:console";

const addReview = async (req: Request, res: Response) => {
  try {
    const result = await ReviewService.addReview(req.body);
    res.status(200).json({
      success: true,
      message: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: err,
    });
  }
};

export const ReviewController = {
  addReview,
};
