import type { NextFunction, Request, Response } from "express";
import app, { PORT } from "./config/app.config.js";
import apiRoute from "./routers/api.router.js";
import { appErrorHandler } from "./errors/handlers/app.error.handler.js";
import logger from "./utils/logger.js";

// * Prefix all routes with /api
app.use("/api", apiRoute);

// * 404 Handler
app.use((_: Request, res: Response) => {
	console.error("404 Not Found");
	return res.status(404).send({ message: "Not Found" });
});

// * Global Error Handler
app.use((error: Error | any, req: Request, res: Response, _: NextFunction) => {
	const appError = appErrorHandler(error);

	const logMessage = `${req.method} ${req.originalUrl} : ${error.message}`;

	logger.error(logMessage, {
		statusCode: appError.status || 500,
		isOperational: appError.isOperational || false,
	});

	console.table(appError);
	console.error(appError.stack);
	return res.status(appError.status || 500).send({
		status: appError.status || 500,
		message: appError.message || "Internal Server Error",
		error: appError.object || null,
	});
});

// * Start the server
app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
