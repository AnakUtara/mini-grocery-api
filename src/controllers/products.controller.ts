import type { NextFunction, Request, Response } from "express";
import { productRepository } from "../repository/products.repo.js";
import { responseBuilder } from "../utils/response.builder.js";
import { usePagination } from "../utils/pagination.js";
import AppError from "../errors/app.error.js";
import { prisma } from "../libs/prisma.client.js";
import {
	createProductSchema,
	updateProductSchema,
	updateStockSchema,
} from "../validations/products.validation.js";

class ProductController {
	// ✅ Get all products
	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { skip, limit, buildMeta } = usePagination(req.query);

			const products = await productRepository.findAll(skip, limit);
			const total = await productRepository.count();

			return res.send(
				responseBuilder(200, "Products fetched successfully", {
					products,
					pagination: buildMeta(total),
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Get product by ID
	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			const product = await productRepository.findById(Number(id));

			if (!product) {
				throw new AppError("Product not found", 404);
			}

			return res.send(
				responseBuilder(200, "Product fetched successfully", product),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Search products by title
	search = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { q } = req.query;

			if (!q || typeof q !== "string") {
				throw new AppError("Search query is required", 400);
			}

			const products = await productRepository.findByTitle(q);

			return res.send(
				responseBuilder(200, "Search results", {
					products,
					count: products.length,
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Create product (Admin only)
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { title, description, price, stock, thumbnailUrl, categoryIds } =
				req.body;

			const validated = await createProductSchema.parseAsync({
				title,
				description,
				price,
				stock,
				thumbnailUrl,
				categoryIds,
			});

			const userId = (req as any).user?.id;

			const product = await productRepository.create({
				title: validated.title,
				description: validated.description,
				price: validated.price,
				stock: validated.stock,
				thumbnailUrl: validated.thumbnailUrl,
				creator: userId,
				updater: userId,
			});

			// Add categories if provided
			if (validated.categoryIds && validated.categoryIds.length > 0) {
				await prisma.productCategory.createMany({
					data: validated.categoryIds.map((categoryId) => ({
						productId: product.id,
						categoryId,
					})),
				});
			}

			return res
				.status(201)
				.send(responseBuilder(201, "Product created successfully", product));
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Update product (Admin only)
	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { title, description, price, stock, thumbnailUrl, categoryIds } =
				req.body;

			const validated = await updateProductSchema.parseAsync({
				title,
				description,
				price,
				stock,
				thumbnailUrl,
				categoryIds,
			});

			const userId = (req as any).user?.id;

			const product = await productRepository.update(Number(id), {
				...validated,
				updater: userId,
			});

			// Update categories if provided
			if (categoryIds) {
				await prisma.productCategory.deleteMany({
					where: { productId: product.id },
				});

				if (categoryIds.length > 0) {
					await prisma.productCategory.createMany({
						data: categoryIds.map((categoryId: number) => ({
							productId: product.id,
							categoryId,
						})),
					});
				}
			}

			return res.send(
				responseBuilder(200, "Product updated successfully", product),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Update stock (Admin only)
	updateStock = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { newStock, notes } = req.body;

			const validated = await updateStockSchema.parseAsync({
				newStock,
				notes,
			});

			const product = await productRepository.findById(Number(id));

			if (!product) {
				throw new AppError("Product not found", 404);
			}

			const userId = (req as any).user?.id;

			await productRepository.updateStock(
				Number(id),
				product.stock,
				validated.newStock,
				userId,
				validated.notes,
			);

			const updatedProduct = await productRepository.findById(Number(id));

			return res.send(
				responseBuilder(200, "Stock updated successfully", updatedProduct),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Delete product (Admin only)
	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			await productRepository.delete(Number(id));

			return res.send(
				responseBuilder(200, "Product deleted successfully", null),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};
}

export default new ProductController();
