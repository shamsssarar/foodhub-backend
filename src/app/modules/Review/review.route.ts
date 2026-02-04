import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

router.post(
  "/reviews",
  auth(USER_ROLE.CUSTOMER), // Only customers can review
  ReviewController.addReview
);

export const ReviewRoutes = router;