import express, { Router } from "express";
import {
	adminGuard,
	verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import categoriesController from "../controllers/categories.controller.js";

export const categoriesRouter: Router = express.Router();

// ✅ Public routes
categoriesRouter.get("/", categoriesController.getAll);
categoriesRouter.get("/:id", categoriesController.getById);

// ✅ Admin only routes
categoriesRouter.post(
	"/",
	verifyAccessToken,
	adminGuard,
	categoriesController.create,
);
categoriesRouter.put(
	"/:id",
	verifyAccessToken,
	adminGuard,
	categoriesController.update,
);
categoriesRouter.delete(
	"/:id",
	verifyAccessToken,
	adminGuard,
	categoriesController.delete,
);
