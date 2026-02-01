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

const updateStatus = async (orderId: string, newStatus: OrderStatus, user: any) => {
  
  // 1. ADMIN Logic
  if (user.role === 'ADMIN') {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
  }

  // 2. PROVIDER Logic
  if (user.role === 'PROVIDER') {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.userId }
    });

    if (!providerProfile) throw new Error("Provider profile not found");

    const myCategory = providerProfile.cuisineType;

    // A. Update ONLY this provider's items (Use AWAIT to ensure it finishes!)
    await prisma.orderItem.updateMany({
      where: {
        orderId: orderId,
        meal: {
          category: {
            name: myCategory
          }
        }
      },
      data: { status: newStatus }
    });

    console.log(`🔹 Provider (${myCategory}) updated items to ${newStatus}`);

    // --- B. SYNC PARENT ORDER STATUS ---
    
    // Fetch the Order and ALL its items fresh from the DB
    const orderCheck = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (orderCheck) {
      // 1. Check status of ALL items in the order
      const allItems = orderCheck.orderItems;
      const allDelivered = allItems.every(item => item.status === 'DELIVERED');
      const anyActive = allItems.some(item => item.status === 'IN_PROGRESS' || item.status === 'DELIVERED');

      console.log("🔍 SYNC CHECK:", {
        orderId,
        totalItems: allItems.length,
        statuses: allItems.map(i => i.status),
        allDelivered
      });

      let finalStatus = orderCheck.status;

      // 2. DECISION LOGIC
      if (allDelivered) {
        finalStatus = 'DELIVERED'; 
      } else if (anyActive && orderCheck.status === 'PENDING') {
        finalStatus = 'IN_PROGRESS'; 
      }

      if (finalStatus !== orderCheck.status) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: finalStatus }
        });
        console.log(`✅ Main Order Updated to: ${finalStatus}`);
      }
    }

    return { message: "Status updated and synced" };
  }
};

const getOrdersByUserIdFromDB = async (userId: string) => {
  return await prisma.order.findMany({
    where: {
      userId: userId, // Filter strictly by the provided ID
    },
    include: {
      user: true,
      orderItems: {
        include: {
          meal: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOrdersForProvider = async (user: any) => {
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

  const myCategoryName = providerProfile.cuisineType;

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

  const formattedOrders = orders.map((order) => {

    const myItems = order.orderItems.filter(
      (item) => item.meal.category.name === myCategoryName,
    );

    const myRevenue = myItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      orderId: order.id,
      customerName: order.user.name,
      status: order.status,
      createdAt: order.createdAt,
      items: myItems,
      totalRevenue: myRevenue,
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
  updateStatus,
  getOrdersByUserIdFromDB,
  getOrdersForProvider,
  deleteOrder,
};
