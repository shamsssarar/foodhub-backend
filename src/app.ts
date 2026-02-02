import express, { Application, Request, Response } from "express";
import cors from "cors";
import { UserRoutes } from "./app/modules/User/user.route";
import { CategoryRoutes } from "./app/modules/Category/category.route";
import { MealRoutes } from "./app/modules/Meal/meal.route";
import { OrderRoutes } from "./app/modules/Order/order.route";
import { ProfileRoutes } from "./app/modules/ProviderProfile/profile.route";
import { ReviewRoutes } from "./app/modules/Service/review.route";
import { AuthRoutes } from "./app/modules/Auth/auth.route";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(
  cors({
    origin: ["https://foodhub-client-mu.vercel.app"],
    credentials: true,
  }),
);

// Application Routes
app.use(
  "/api",
  UserRoutes,
  CategoryRoutes,
  MealRoutes,
  OrderRoutes,
  ProfileRoutes,
  ReviewRoutes,
  AuthRoutes,
);
app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("FoodHub Backend is Running!");
});

export default app;
