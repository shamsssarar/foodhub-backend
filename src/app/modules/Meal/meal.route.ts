import express from "express";
import { MealController } from "./meal.controller";
import { USER_ROLE } from "../User/user.constant";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/meals", auth(USER_ROLE.PROVIDER), MealController.createMeal);
router.get("/meals", MealController.getAllMeals);
router.get(
  "/meals/my-meals",
  auth(USER_ROLE.PROVIDER),
  MealController.getMyMeals,
);
router.delete(
  "/meals/:id", 
  auth(USER_ROLE.PROVIDER),
  MealController.deleteMyMeal
);

export const MealRoutes = router;
