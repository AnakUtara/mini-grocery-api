import { prisma } from "../libs/prisma.client.js";
import type { Products, Prisma } from "../generated/prisma/client.js";

class ProductRepository {
	// ✅ Find all products with pagination
	findAll = async (skip: number = 0, take: number = 10) => {
		return await prisma.products.findMany({
			where: { deletedAt: null },
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				categories: { include: { category: true } },
			},
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	};

	// ✅ Find by ID
	findById = async (id: number) => {
		return await prisma.products.findUnique({
			where: { id, deletedAt: null },
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				categories: { include: { category: true } },
			},
		});
	};

	// ✅ Find by title (search)
	findByTitle = async (title: string) => {
		return await prisma.products.findMany({
			where: {
				title: { contains: title, mode: "insensitive" },
				deletedAt: null,
			},
			include: {
				creator: { select: { id: true, email: true } },
				categories: { include: { category: true } },
			},
		});
	};

	// ✅ Create product
	create = async (data: Prisma.ProductsCreateInput) => {
		return await prisma.products.create({
			data,
			include: {
				creator: { select: { id: true, email: true } },
				categories: { include: { category: true } },
			},
		});
	};

	// ✅ Update product
	update = async (id: number, data: Prisma.ProductsUpdateInput) => {
		return await prisma.products.update({
			where: { id, deletedAt: null },
			data,
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				categories: { include: { category: true } },
			},
		});
	};

	// ✅ Soft delete product
	delete = async (id: number) => {
		return await prisma.products.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	};

	// ✅ Update stock + log history
	updateStock = async (
		productId: number,
		oldStock: number,
		newStock: number,
		userId: number,
		notes?: string,
	) => {
		return await prisma.$transaction([
			prisma.products.update({
				where: { id: productId },
				data: { stock: newStock, updatedBy: userId },
			}),
			prisma.productStockHistory.create({
				data: { productId, oldStock, newStock, notes },
			}),
		]);
	};

	// ✅ Count total products
	count = async () => {
		return await prisma.products.count({
			where: { deletedAt: null },
		});
	};
}

export const productRepository = new ProductRepository();
