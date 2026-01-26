import express from "express";
import { FoodController } from "./food.controller";

const router = express.Router();

router.post("/foods", FoodController.createFood);
router.get("/foods", FoodController.getAllFoods);

export const FoodRoutes = router;