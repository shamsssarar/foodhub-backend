import { Request, Response } from "express";
import { OrderService } from "./order.service";

const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body;
    const result = await OrderService.createOrderIntoDB(userId, { items });

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
      error: err,
    });
  }
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await OrderService.getAllOrdersFromDB(user);
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully!",
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

const updateStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // We will send { "status": "DELIVERED" }

    const result = await OrderService.updateOrderStatusInDB(
      orderId as string,
      status,
    );
    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
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

// src/app/modules/Order/order.controller.ts
const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await OrderService.getOrdersByUserIdFromDB(userId as string);
    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully!",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders", error: err });
  }
};



const getMyProviderOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user; // Assuming your auth middleware puts the user here
    const result = await OrderService.getOrdersForProvider(user);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Provider orders retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const deleteOrder = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.deleteOrder(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Order deleted successfully!",
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
export const OrderController = {
  createOrder,
  getAllOrders,
  updateStatus,
  getOrdersByUserId,
  getMyProviderOrders,
  deleteOrder,
};
