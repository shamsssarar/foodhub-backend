import { Request, Response } from "express";
import { MealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
  try {
    console.log("User from Token:", (req as any).user);
    console.log("Body:", req.body);
    const userId = (req as any).user.userId;

    const result = await MealService.createMealIntoDB(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Food created successfully!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
    console.error("❌ THE REAL ERROR IS:", err);
  }
};

const getAllMeals = async (req: Request, res: Response) => {
  try {
    const result = await MealService.getAllMealsFromDB();
    res.status(200).json({
      success: true,
      message: "Foods retrieved successfully!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
};

const getMyMeals = async (req: Request, res: Response) => {
  try {
    // 1. Get User ID from the token
    const userId = (req as any).user.userId;

    // 2. Call the service
    const result = await MealService.getMyMeals(userId);

    // 3. Send Success Response
    res.status(200).json({
      success: true,
      message: "My meals retrieved successfully",
      data: result,
    });
  } catch (error) {
    // 4. Handle Errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve meals",
      error: error,
    });
  }
};

const deleteMyMeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The Meal ID to delete

    // Get the logged-in Provider's ID from the token
    const userId = (req as any).user.userId || (req as any).user.id;

    // 1. Call the service (which checks ownership first)
    const result = await MealService.deleteMyMeal(id as string, userId);

    // 2. Send Success Response
    res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
      data: result,
    });
  } catch (error: any) {
    // 3. Handle Errors (e.g. "Meal not found" or "Permission denied")
    console.error("Error deleting meal:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete meal",
      error: error,
    });
  }
};

export const MealController = {
  createMeal,
  getAllMeals,
  getMyMeals,
  deleteMyMeal,
};
