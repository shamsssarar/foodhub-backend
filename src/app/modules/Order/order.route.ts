import express from "express";
import { OrderController } from "./order.controller";
import { USER_ROLE } from "../User/user.constant";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/orders", auth(USER_ROLE.CUSTOMER), OrderController.createOrder);
router.get(
  "/orders",
  auth(USER_ROLE.ADMIN, USER_ROLE.PROVIDER, USER_ROLE.CUSTOMER),
  OrderController.getAllOrders,
);
router.patch(
  "/orders/:orderId/status",
  auth(USER_ROLE.ADMIN, USER_ROLE.PROVIDER),
  OrderController.updateStatus,
);

export const OrderRoutes = router;
