import { Order } from "@prisma/client";
import prisma from "../../../shared/prisma";

const createOrderIntoDB = async (data: Order) => {
  const result = await prisma.order.create({
    data,
  });
  return result;
};

const getAllOrdersFromDB = async () => {
  const result = await prisma.order.findMany({
    include: {
      user: true, // It shows Who ordered the food!
    },
  });
  return result;
};

export const OrderService = {
  createOrderIntoDB,
  getAllOrdersFromDB,
};