import express from "express";
import { ProfileController } from "./profile.controller";


const router = express.Router();

router.post("/profile", ProfileController.updateProfile);
router.get("/profile/:userId", ProfileController.getProfile);


export const ProfileRoutes = router;