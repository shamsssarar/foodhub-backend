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
    // 1. Get the User ID from the token (attached by auth middleware)
    const userId = (req as any).user.id; 

    // 2. Call the service
    const result = await UserService.getMyProviderProfile(userId);

    // 3. Send Success Response
    res.status(200).json({
      success: true,
      message: "Provider profile retrieved successfully",
      data: result,
    });

  } catch (err: any) {
    // 4. Handle Errors
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve profile",
      error: err,
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
