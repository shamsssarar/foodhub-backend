import { Order, OrderStatus } from "@prisma/client"; // Import OrderStatus if needed
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError"; // Fixed import (No curly braces)
import { any } from "zod";
import { error } from "node:console";

const createOrderIntoDB = async (
  userId: string,
  payload: { items: { mealId: string; quantity: number }[] },
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

const getAllOrdersFromDB = async (user: any) => {
  if (user.role === "CUSTOMER") {
    return await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            meal: true,
          },
        },
      },
    });
  } else if (user.role === "PROVIDER") {
    return await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            meal: true,
          },
        },
        user: true,
      },
    });
  } else if (user.role === "ADMIN") {
    // Only admins see everything
    const result = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            meal: true,
          },
        },
      },
    });
    return result;
  } else {
    console.log(error);
    throw new ApiError(404, "jhj");
  }
};

const updateOrderStatusInDB = async (orderId: string, status: OrderStatus) => {
  const result = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  return result;
};

// src/app/modules/Order/order.service.ts
const getOrdersByUserIdFromDB = async (userId: string) => {
  return await prisma.order.findMany({
    where: {
      userId: userId, // Filter strictly by the provided ID
    },
    include: {
      user: true,
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOrdersForProvider = async (user: any) => {
  // 1. Find the Provider's Profile to see what Category they own
  console.log("🔹 PROVIDER DEBUG - User Object:", user);
  const providerId = user.userId;
  if (!providerId) {
    throw new Error("User ID is missing/undefined in the request token.");
  }
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    include: { category: true },
  });

  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const myCategoryName = providerProfile.cuisineType; // e.g., "Burger"

  // 2. Find ALL Orders that have at least one item from this Category
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          meal: {
            category: {
              name: myCategoryName,
            },
          },
        },
      },
    },
    include: {
      user: {
        // The Customer details
        select: {
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          meal: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. THE MAGIC FILTER: Strip out items that don't belong to this provider
  const formattedOrders = orders.map((order) => {
    // Filter the items array to keep ONLY "Burger" items (for the Burger guy)
    const myItems = order.orderItems.filter(
      (item) => item.meal.category.name === myCategoryName,
    );

    // Recalculate the total money for JUST these items
    const myRevenue = myItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      orderId: order.id,
      customerName: order.user.name,
      status: order.status,
      createdAt: order.createdAt,
      items: myItems, // <--- Only sending YOUR items
      totalRevenue: myRevenue, // <--- Only showing YOUR money
    };
  });

  return formattedOrders;
};

const deleteOrder = async (id: string) => {
  const result = await prisma.order.delete({
    where: { id },
  });
  return result;
};

export const OrderService = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
  getOrdersByUserIdFromDB,
  getOrdersForProvider,
  deleteOrder,
};
