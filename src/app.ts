import express, { Application, Request, Response } from "express";
import cors from "cors";
import { UserRoutes } from "./app/modules/User/user.route";
import { CategoryRoutes } from "./app/modules/Category/category.route";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Application Routes
app.use("/api", UserRoutes);
app.use("/api", CategoryRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("FoodHub Backend is Running!");
});

export default app;
