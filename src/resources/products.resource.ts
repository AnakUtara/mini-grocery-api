import express, { Router } from "express";
import {
	adminGuard,
	verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import productsController from "../controllers/products.controller.js";

export const productsRouter: Router = express.Router();

// ✅ Public routes
productsRouter.get("/", productsController.getAll);
productsRouter.get("/search", productsController.search);
productsRouter.get("/:id", productsController.getById);

// ✅ Admin only routes
productsRouter.post(
	"/",
	verifyAccessToken,
	adminGuard,
	productsController.create,
);
productsRouter.put(
	"/:id",
	verifyAccessToken,
	adminGuard,
	productsController.update,
);
productsRouter.patch(
	"/:id/stock",
	verifyAccessToken,
	adminGuard,
	productsController.updateStock,
);
productsRouter.delete(
	"/:id",
	verifyAccessToken,
	adminGuard,
	productsController.delete,
);
