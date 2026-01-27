import { Request, Response } from "express";
import { ProfileService } from "./profile.service";

const updateProfile = async (req: Request, res: Response) => {
  try {
    const result = await ProfileService.createOrUpdateProfile(req.body);
    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully!",
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

const getProfile = async (req: Request, res: Response) => {
  try {
    // We expect userId to come from the URL (e.g., /profile/123)
    const { userId } = req.params;
    const result = await ProfileService.getProfile(userId as string);
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully!",
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

export const ProfileController = {
  updateProfile,
  getProfile,
};
