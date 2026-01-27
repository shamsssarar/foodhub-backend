import express from "express";
import { MealController } from "./meal.controller";

const router = express.Router();

router.post("/meals", MealController.createMeal);
router.get("/meals", MealController.getAllMeals);

export const MealRoutes = router;
