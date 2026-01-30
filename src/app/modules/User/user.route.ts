import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.post("/create-user", UserController.createUser);
router.get("/users", UserController.getAllUsers);
router.delete("/users/:id", UserController.deleteUser);

export const UserRoutes = router;
