import express, { Router } from "express";
import {
	adminGuard,
	verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import { imageUploader, fileUploader } from "../middlewares/express/multer.js";
import cloudinaryStorageController from "../controllers/cloudinary.storage.controller.js";

export const cloudinaryStorageRouter: Router = express.Router();

cloudinaryStorageRouter.post(
	"/image",
	verifyAccessToken,
	adminGuard,
	imageUploader.single("file"),
	cloudinaryStorageController.uploadImage,
);

cloudinaryStorageRouter.post(
	"/product-image",
	verifyAccessToken,
	adminGuard,
	imageUploader.single("file"),
	cloudinaryStorageController.uploadProductImage,
);

cloudinaryStorageRouter.post(
	"/file",
	verifyAccessToken,
	adminGuard,
	fileUploader.single("file"),
	cloudinaryStorageController.uploadFile,
);
