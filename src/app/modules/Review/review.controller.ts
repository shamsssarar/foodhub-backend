import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const addReview = async (req: Request, res: Response) => {
  try {
    // 1. Robust User ID Extraction
    const user = (req as any).user;
    const userId = user?.userId || user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID missing" });
    }

    // 🕵️‍♂️ DEBUG LOGS: Print what we are receiving
    console.log("📝 Adding Review...");
    console.log("User ID:", userId);
    console.log("Payload:", req.body); // Check if mealId, rating, comment are here

    // 2. Call Service
    const result = await ReviewService.createReview(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: result,
    });
  } catch (err: any) {
    // 🛑 LOG THE EXACT ERROR
    console.error("❌ REVIEW CREATE ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to add review",
      errorDetails: err.message, // Send detailed error to frontend
    });
  }
};

export const ReviewController = {
  addReview,
};