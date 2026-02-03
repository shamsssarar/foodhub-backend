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
    origin: ["https://foodhub-client-mu.vercel.app","http://localhost:3000"],
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
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FoodHub Server</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fafc;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                text-align: center;
                max-width: 400px;
                width: 90%;
                border-top: 5px solid #ef4444;
            }
            h1 { color: #0f172a; margin-bottom: 0.5rem; font-size: 2rem; }
            .status {
                display: inline-flex;
                align-items: center;
                background-color: #dcfce7;
                color: #166534;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                background-color: #16a34a;
                border-radius: 50%;
                margin-right: 8px;
                box-shadow: 0 0 0 2px #dcfce7;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            p { color: #64748b; line-height: 1.6; margin-bottom: 2rem; }
            .btn {
                display: inline-block;
                background-color: #0f172a;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                text-decoration: none;
                font-weight: 600;
                transition: transform 0.1s;
            }
            .btn:hover { transform: translateY(-2px); }
            .footer { margin-top: 2rem; font-size: 0.75rem; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>FoodHub Server 🚀</h1>
            <div class="status"><div class="status-dot"></div>System Operational</div>
            <p>Welcome to the Multi-Vendor API. <br> Serving delicious data to the frontend.</p>
            <a href="https://foodhub-client-mu.vercel.app" class="btn">Visit Client App</a>
            <div class="footer">v1.0.0 • Powered by Express & Prisma</div>
        </div>
    </body>
    </html>
  `);
});

export default app;
