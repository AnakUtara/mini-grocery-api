import { prisma } from "../libs/prisma.client.js";
import type { Category, Prisma } from "../generated/prisma/client.js";

class CategoryRepository {
	// ✅ Find all categories
	findAll = async (skip: number = 0, take: number = 10) => {
		return await prisma.category.findMany({
			where: { deletedAt: null },
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				products: { include: { product: true } },
			},
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	};

	// ✅ Find by ID
	findById = async (id: number) => {
		return await prisma.category.findUnique({
			where: { id, deletedAt: null },
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				products: { include: { product: true } },
			},
		});
	};

	// ✅ Find by name
	findByName = async (name: string) => {
		return await prisma.category.findFirst({
			where: { name: { equals: name, mode: "insensitive" }, deletedAt: null },
		});
	};

	// ✅ Create category
	create = async (data: Prisma.CategoryCreateInput) => {
		return await prisma.category.create({
			data,
			include: {
				creator: { select: { id: true, email: true } },
				products: { include: { product: true } },
			},
		});
	};

	// ✅ Update category
	update = async (id: number, data: Prisma.CategoryUpdateInput) => {
		return await prisma.category.update({
			where: { id, deletedAt: null },
			data,
			include: {
				creator: { select: { id: true, email: true } },
				updater: { select: { id: true, email: true } },
				products: { include: { product: true } },
			},
		});
	};

	// ✅ Soft delete category
	delete = async (id: number) => {
		return await prisma.category.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	};

	// ✅ Count total categories
	count = async () => {
		return await prisma.category.count({
			where: { deletedAt: null },
		});
	};
}

export const categoryRepository = new CategoryRepository();
