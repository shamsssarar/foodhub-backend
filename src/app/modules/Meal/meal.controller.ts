import { Request, Response } from "express";
import { MealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
  try {
    const result = await MealService.createMealIntoDB(req.body);
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

export const MealController = {
  createMeal,
  getAllMeals,
};
