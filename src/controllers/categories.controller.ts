import type { NextFunction, Request, Response } from "express";
import { categoryRepository } from "../repository/categories.repo.js";
import { responseBuilder } from "../utils/response.builder.js";
import { usePagination } from "../utils/pagination.js";
import AppError from "../errors/app.error.js";
import {
	createCategorySchema,
	updateCategorySchema,
} from "../validations/categories.validation.js";

class CategoryController {
	// ✅ Get all categories
	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { skip, limit, buildMeta } = usePagination(req.query);

			const categories = await categoryRepository.findAll(skip, limit);
			const total = await categoryRepository.count();

			return res.send(
				responseBuilder(200, "Categories fetched successfully", {
					categories,
					pagination: buildMeta(total),
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Get category by ID
	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			const category = await categoryRepository.findById(Number(id));

			if (!category) {
				throw new AppError("Category not found", 404);
			}

			return res.send(
				responseBuilder(200, "Category fetched successfully", category),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Create category (Admin only)
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name } = req.body;

			const validated = await createCategorySchema.parseAsync({ name });

			// Check if category already exists
			const existing = await categoryRepository.findByName(validated.name);

			if (existing) {
				throw new AppError("Category already exists", 409);
			}

			const userId = (req as any).user?.id;

			const category = await categoryRepository.create({
				name: validated.name,
				creator: userId,
				updater: userId,
			});

			return res
				.status(201)
				.send(responseBuilder(201, "Category created successfully", category));
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Update category (Admin only)
	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { name } = req.body;

			const validated = await updateCategorySchema.parseAsync({ name });

			const userId = (req as any).user?.id;

			const category = await categoryRepository.update(Number(id), {
				...validated,
				updater: userId,
			});

			return res.send(
				responseBuilder(200, "Category updated successfully", category),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Delete category (Admin only)
	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			await categoryRepository.delete(Number(id));

			return res.send(
				responseBuilder(200, "Category deleted successfully", null),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};
}

export default new CategoryController();
