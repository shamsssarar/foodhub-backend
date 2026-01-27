import express from "express";
import { ReviewController } from "./review.controller";
import { Recoverable } from "node:repl";

const router = express.Router();

router.post("/reviews", ReviewController.addReview);

export const ReviewRoutes = router;
