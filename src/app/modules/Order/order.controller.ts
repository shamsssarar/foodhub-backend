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

export const OrderController = {
  createOrder,
  getAllOrders,
};