import { Order, OrderStatus } from "@prisma/client"; // Import OrderStatus if needed
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError"; // Fixed import (No curly braces)

const createOrderIntoDB = async (
  userId: string,
  payload: { items: { mealId: string; quantity: number }[] }
) => {
  // 1. Calculate Total Price & Verify Meals exist
  let calculatedTotalPrice = 0;
  const orderItemsData = [];

  if (!payload.items || payload.items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  for (const item of payload.items) {
    const meal = await prisma.meal.findUnique({
      where: { id: item.mealId },
    });

    if (!meal) {
      throw new ApiError(404, `Meal not found: ${item.mealId}`);
    }

    calculatedTotalPrice += meal.price * item.quantity;

    orderItemsData.push({
      mealId: item.mealId,
      quantity: item.quantity,
      price: meal.price,
    });
  }

  // 2. Create the Order AND the OrderItems in one transaction
  const result = await prisma.order.create({
    data: {
      userId,
      totalPrice: calculatedTotalPrice,
      status: "PENDING",
      orderItems: {
        create: orderItemsData, // This creates the rows in the OrderItem table automatically!
      },
    },
    include: {
      orderItems: true,
    },
  });

  return result;
};

const getAllOrdersFromDB = async () => {
  const result = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true, // Only show safe user info
        },
      },
      orderItems: {
        include: {
          meal: true, // Shows the Meal details inside the order
        },
      },
    },
  });
  return result;
};

const updateOrderStatusInDB = async (orderId: string, status: OrderStatus) => {
  const result = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  return result;
};

export const OrderService = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
};