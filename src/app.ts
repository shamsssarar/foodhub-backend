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
app.use(cors());

// Application Routes
app.use("/api", UserRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", MealRoutes);
app.use("/api", OrderRoutes);
app.use("/api", ProfileRoutes);
app.use("/api", ReviewRoutes);
app.use("/api", AuthRoutes);
app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("FoodHub Backend is Running!");
});

export default app;
