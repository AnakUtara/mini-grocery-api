import express, { Router } from "express";
import { appName } from "../config/env.config.js";
import { authRouter } from "../resources/auth.resource.js";
import { cloudinaryStorageRouter } from "../resources/cloudinary.storage.resource.js";
import { productsRouter } from "../resources/products.resource.js";
import { categoriesRouter } from "../resources/categories.resource.js";
import { ordersRouter } from "../resources/orders.resource.js";

const apiRouter: Router = express.Router();

// * API Welcome Route
apiRouter.get("/", (_, res) => res.send(`Welcome to the ${appName}`));

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/cloudinary-storage", cloudinaryStorageRouter);
apiRouter.use("/health", (_, res) => res.send("OK"));

export default apiRouter;
