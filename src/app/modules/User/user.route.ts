import express from "express";
import { UserController } from "./user.controller";
import { USER_ROLE } from "./user.constant";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create-user", UserController.createUser);
router.get("/users", UserController.getAllUsers);
router.delete("/users/:id", UserController.deleteUser);
router.patch(
  "/users/:providerId/status",
  auth(USER_ROLE.ADMIN), 
  UserController.updateProviderStatus,
);
router.patch(
  "/users/:userId/assign-category",
  auth(USER_ROLE.ADMIN), // Only Admin can do this
  UserController.assignCategory
);
router.get(
  "/provider-profile",
  auth(USER_ROLE.PROVIDER), // Only Providers can call this
  UserController.getMyProfile
);
export const UserRoutes = router;
