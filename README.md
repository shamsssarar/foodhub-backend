# FoodHub Server 🚀

> The robust, high-performance backend API powering the FoodHub Multi-Vendor Marketplace.

[![Live API](https://img.shields.io/badge/API-Online-green.svg)](https://foodhub-azure-tau.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Express](https://img.shields.io/badge/Express.js-4.18-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-darkblue)

## 🔗 Live API Base URL
**Production Endpoint:** `https://foodhub-azure-tau.vercel.app/api`

## 📖 Overview

**FoodHub Server** is a scalable RESTful API designed to handle complex multi-vendor e-commerce logic. Unlike traditional e-commerce backends, this system implements a **Split-Order Architecture**.

When a customer places a single "cart" order containing items from multiple vendors (e.g., Pizza from Provider A, Burger from Provider B), the backend intelligently:
1.  **Deconstructs** the order into item-level components.
2.  **Routes** specific items to their respective Provider's dashboard.
3.  **Synchronizes** status updates (e.g., when a Provider marks an item as "Cooking", the parent order status updates dynamically).

## ✨ Key System Architecture

### 🧠 Intelligent Order Sync
The system utilizes an advanced synchronization logic in `OrderService`. It monitors individual `OrderItem` statuses. Only when *all* items in a parent order are marked `DELIVERED` does the main order status flip to `COMPLETED`. This allows for granular tracking in a multi-chef environment.

### 🛡️ Role-Based Access Control (RBAC)
Secure middleware (`auth.ts`) enforces strict permission levels using JWT:
* **ADMIN:** Full system oversight, user management, and global order control.
* **PROVIDER:** Can only access orders containing *their* specific meal categories.
* **CUSTOMER:** Can only view and manage their own purchase history.

### 🏗️ Modular Architecture
The codebase is structured using a **Module-Service-Controller** pattern, ensuring separation of concerns and maintainability.
* **Modules:** Self-contained units (Auth, User, Order, Meal).
* **Services:** Business logic and database interactions.
* **Controllers:** Request/Response handling.

## 🛠️ Tech Stack

* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on NeonDB)
* **Authentication:** JWT (JSON Web Tokens) with Access & Refresh Token rotation.
* **Validation:** Zod
* **Deployment:** Vercel

## 📂 Project Structure

```bash
src/
├── app/
│   ├── middlewares/     # Global auth & error handling
│   │   ├── auth.ts      # JWT verification & Role checks
│   │   └── globalErrorHandler.ts
│   ├── modules/         # Business Logic Modules
│   │   ├── Auth/        # Login/Register logic
│   │   ├── User/        # User management
│   │   ├── Meal/        # Meal CRUD operations
│   │   ├── Order/       # Complex Order Split Logic
│   │   ├── Provider/    # Provider Profile management
│   │   └── Category/    # Meal categorization
│   └── routes/          # Application Router definition
├── config/              # Environment config
├── shared/              # Shared utilities (Pickers, Constants)
├── app.ts               # Express App definition & CORS
└── server.ts            # Entry point & Database 
```

## 🔌 Key API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User login (returns Access/Refresh tokens) | Public |
| `POST` | `/api/auth/register` | Create a new Customer or Provider account | Public |

### 📦 Orders (The Core Logic)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/user/:userId` | Get order history for a specific customer | **Customer/Admin** |
| `GET` | `/api/orders/provider-orders` | **Split Logic:** Get only items belonging to the logged-in Provider | **Provider** |
| `POST` | `/api/orders` | Place a new multi-vendor order | **Customer** |
| `PATCH` | `/api/orders/:orderId/status` | Update status (Triggers Sync Logic) | **Provider/Admin** |

### 🍔 Meals & Providers
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/meals` | Get all available meals (with filters) | Public |
| `POST` | `/api/meals` | Create a new meal | **Provider** |
| `GET` | `/api/provider-profile` | Get provider details | **Provider** |

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL Database (Local or Cloud)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/shamsssarar/foodhub-backend.git](https://github.com/shamsssarar/foodhub-backend.git)
    cd foodhub-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
    JWT_ACCESS_SECRET="your_super_secret_access_key"
    JWT_REFRESH_SECRET="your_super_secret_refresh_key"
    JWT_ACCESS_EXPIRES_IN="1d"
    JWT_REFRESH_EXPIRES_IN="365d"
    NODE_ENV="development"
    ```

4.  **Database Migration**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🚢 Deployment (Vercel)

This API is optimized for serverless deployment on Vercel.

1.  **Configuration:** Uses `vercel.json` to route traffic to `dist/server.js`.
2.  **CORS:** Configured in `app.ts` to strictly allow requests from the frontend domain (`https://foodhub-client-mu.vercel.app`).
3.  **Environment Variables:** All secrets must be added to the Vercel Project Settings.

## 👥 Contributors

* **[Shams Sarar]** - *Lead Backend Architect* - [GitHub Profile](https://github.com/shamsssarar)

