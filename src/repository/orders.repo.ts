import { prisma } from "../libs/prisma.client.js";
import type { Order, Prisma } from "../generated/prisma/client.js";

class OrderRepository {
	// ✅ Find all orders
	findAll = async (skip: number = 0, take: number = 10) => {
		return await prisma.order.findMany({
			include: {
				user: { select: { id: true, email: true } },
				orderItems: { include: { product: true } },
			},
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	};

	// ✅ Find by ID
	findById = async (id: number) => {
		return await prisma.order.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, email: true } },
				orderItems: { include: { product: true } },
			},
		});
	};

	// ✅ Find orders by user ID
	findByUserId = async (
		userId: number,
		skip: number = 0,
		take: number = 10,
	) => {
		return await prisma.order.findMany({
			where: { userId },
			include: {
				user: { select: { id: true, email: true } },
				orderItems: { include: { product: true } },
			},
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	};

	// ✅ Create order with items
	create = async (data: Prisma.OrderCreateInput) => {
		return await prisma.order.create({
			data,
			include: {
				user: { select: { id: true, email: true } },
				orderItems: { include: { product: true } },
			},
		});
	};

	// ✅ Update order status
	updateStatus = async (
		id: number,
		status: "PENDING" | "COMPLETED" | "CANCELLED",
	) => {
		return await prisma.order.update({
			where: { id },
			data: { status },
			include: {
				user: { select: { id: true, email: true } },
				orderItems: { include: { product: true } },
			},
		});
	};

	// ✅ Count total orders
	count = async () => {
		return await prisma.order.count();
	};

	// ✅ Count user orders
	countByUser = async (userId: number) => {
		return await prisma.order.count({
			where: { userId },
		});
	};
}

export const orderRepository = new OrderRepository();
