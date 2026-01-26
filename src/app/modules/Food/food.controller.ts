import { Request, Response } from "express";
import { FoodService } from "./food.service";

const createFood = async (req: Request, res: Response) => {
  try {
    const result = await FoodService.createFoodIntoDB(req.body);
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

const getAllFoods = async (req: Request, res: Response) => {
  try {
    const result = await FoodService.getAllFoodsFromDB();
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

export const FoodController = {
  createFood,
  getAllFoods,
};