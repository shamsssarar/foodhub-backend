import { Request, Response } from "express";
import { UserService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "User created successfully!",
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

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrived successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};

const updateProviderStatus = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { status } = req.body;
    const result = await UserService.updateProviderStatus(
      providerId as string,
      status,
    );
    res.status(200).json({
      success: true,
      message: "ProviderUser Updated successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};

const getMyProfile = async (req: Request, res: Response) => {
  try {
    // 🕵️‍♂️ DEBUGGING LOGS (Check Vercel Function Logs to see these)
    console.log("Decoded User from Token:", (req as any).user);

    const user = (req as any).user;

    const currentUserId = user?.userId || user?.id;

    // Safety Check: specific error if token didn't decode right
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing from token",
      });
    }

    // Call Service
    const result = await UserService.getMyProviderProfile(currentUserId);

    // Safety Check: If profile is null (user exists but is not a provider yet)
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found. Please complete registration.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider profile retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("GET PROFILE ERROR:", err); // Only Admin can see this in Vercel logs

    // Return a generic error to frontend so it doesn't just hang
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errorDetails: err.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.deleteUser(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Users deleted successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};

export const UserController = {
  createUser,
  getAllUsers,
  updateProviderStatus,
  getMyProfile,
  deleteUser,
};
