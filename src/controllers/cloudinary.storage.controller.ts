import type { NextFunction, Request, Response } from "express";
import { Readable } from "stream";
import AppError from "../errors/app.error.js";
import { responseBuilder } from "../utils/response.builder.js";
import cloudinary from "../libs/cloudinary.js";
import path from "path";

class CloudinaryStorageController {
	private baseParentFolder = "mini_grocery_uploads";

	uploadImage = (req: Request, res: Response, next: NextFunction) => {
		if (!req.file) return next(new AppError("No file uploaded", 400));

		const folder = `${this.baseParentFolder}/${req.user!.email}/images`;
		const stream = cloudinary.uploader.upload_stream(
			{ folder },
			(error, result) => {
				if (error || !result)
					return next(new AppError("Upload failed", 500, error));
				return res.send(
					responseBuilder(200, "Uploaded!", { url: result.secure_url }),
				);
			},
		);
		Readable.from(req.file.buffer).pipe(stream);
	};

	uploadProductImage = (req: Request, res: Response, next: NextFunction) => {
		if (!req.file) return next(new AppError("No file uploaded", 400));

		const folder = `${this.baseParentFolder}/products`;
		const stream = cloudinary.uploader.upload_stream(
			{ folder },
			(error, result) => {
				if (error || !result)
					return next(new AppError("Upload failed", 500, error));
				return res.send(
					responseBuilder(200, "Uploaded!", { url: result.secure_url }),
				);
			},
		);
		Readable.from(req.file.buffer).pipe(stream);
	};

	uploadFile = (req: Request, res: Response, next: NextFunction) => {
		if (!req.file) return next(new AppError("No file uploaded", 400));

		const folder = `${this.baseParentFolder}/${req.user!.email}/files`;
		const ext = path.extname(req.file.originalname);
		const baseName = path.basename(req.file.originalname, ext);
		const filename = `${baseName}-${Date.now()}${ext}`;
		const stream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: "raw",
				public_id: filename,
				access_mode: "public",
			},
			(error, result) => {
				if (error || !result)
					return next(new AppError("Upload failed", 500, error));
				return res.send(
					responseBuilder(200, "Uploaded!", { url: result.secure_url }),
				);
			},
		);
		Readable.from(req.file.buffer).pipe(stream);
	};
}

export default new CloudinaryStorageController();
