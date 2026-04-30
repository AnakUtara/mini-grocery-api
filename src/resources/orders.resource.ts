import express, { Router } from "express";
import {
	adminGuard,
	verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import ordersController from "../controllers/orders.controller.js";

export const ordersRouter: Router = express.Router();

// ✅ User routes
ordersRouter.get(
	"/user/my-orders",
	verifyAccessToken,
	ordersController.getUserOrders,
);
ordersRouter.post("/", verifyAccessToken, ordersController.create);
ordersRouter.patch("/:id/cancel", verifyAccessToken, ordersController.cancel);

// ✅ Admin only routes
ordersRouter.get("/", verifyAccessToken, adminGuard, ordersController.getAll);
ordersRouter.get(
	"/:id",
	verifyAccessToken,
	adminGuard,
	ordersController.getById,
);
ordersRouter.patch(
	"/:id/status",
	verifyAccessToken,
	adminGuard,
	ordersController.updateStatus,
);
