import { Request, Response } from "express";
import { OrderService } from "./order.service";

const createOrder = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.createOrderIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
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

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.getAllOrdersFromDB();
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

export const OrderController = {
  createOrder,
  getAllOrders,
  updateStatus,
};
