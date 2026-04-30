import type { NextFunction, Request, Response } from "express";
import { orderRepository } from "../repository/orders.repo.js";
import { productRepository } from "../repository/products.repo.js";
import { responseBuilder } from "../utils/response.builder.js";
import { usePagination } from "../utils/pagination.js";
import AppError from "../errors/app.error.js";
import { prisma } from "../libs/prisma.client.js";
import {
	createOrderSchema,
	updateOrderStatusSchema,
} from "../validations/orders.validation.js";

class OrderController {
	// ✅ Get all orders (Admin only)
	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { skip, limit, buildMeta } = usePagination(req.query);

			const orders = await orderRepository.findAll(skip, limit);
			const total = await orderRepository.count();

			return res.send(
				responseBuilder(200, "Orders fetched successfully", {
					orders,
					pagination: buildMeta(total),
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Get order by ID
	getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const userId = (req as any).user?.id;

			const order = await orderRepository.findById(Number(id));

			if (!order) {
				throw new AppError("Order not found", 404);
			}

			// Check if user owns this order (unless admin)
			if (order.userId !== userId && (req as any).user?.role !== "ADMIN") {
				throw new AppError("Unauthorized", 403);
			}

			return res.send(
				responseBuilder(200, "Order fetched successfully", order),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Get user's orders
	getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { skip, limit, buildMeta } = usePagination(req.query);
			const userId = (req as any).user?.id;

			const orders = await orderRepository.findByUserId(userId, skip, limit);
			const total = await orderRepository.countByUser(userId);

			return res.send(
				responseBuilder(200, "User orders fetched successfully", {
					orders,
					pagination: buildMeta(total),
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Create order
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { items } = req.body;
			const userId = (req as any).user?.id;

			const validated = await createOrderSchema.parseAsync({ items });

			// Calculate total price and validate products
			let totalPrice = 0;
			const orderItems: any[] = [];

			for (const item of validated.items) {
				const product = await productRepository.findById(item.productId);

				if (!product) {
					throw new AppError(`Product ${item.productId} not found`, 404);
				}

				if (product.stock < item.quantity) {
					throw new AppError(
						`Insufficient stock for product: ${product.title}`,
						400,
					);
				}

				const itemTotal = product.price * item.quantity;
				totalPrice += itemTotal;

				orderItems.push({
					productId: item.productId,
					quantity: item.quantity,
					price: product.price,
				});
			}

			// Create order and items in transaction
			const order = await prisma.$transaction(async (tx) => {
				const newOrder = await tx.order.create({
					data: {
						userId,
						totalPrice,
						status: "PENDING",
					},
				});

				// Create order items
				await tx.orderItem.createMany({
					data: orderItems.map((item) => ({
						...item,
						orderId: newOrder.id,
					})),
				});

				// Update product stocks
				for (const item of orderItems) {
					await tx.products.update({
						where: { id: item.productId },
						data: { stock: { decrement: item.quantity } },
					});
				}

				return newOrder;
			});

			const completeOrder = await orderRepository.findById(order.id);

			return res
				.status(201)
				.send(
					responseBuilder(201, "Order created successfully", completeOrder),
				);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Update order status (Admin only)
	updateStatus = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { status } = req.body;

			const validated = await updateOrderStatusSchema.parseAsync({ status });

			const order = await orderRepository.updateStatus(
				Number(id),
				validated.status,
			);

			return res.send(
				responseBuilder(200, "Order status updated successfully", order),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Cancel order
	cancel = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const userId = (req as any).user?.id;

			const order = await orderRepository.findById(Number(id));

			if (!order) {
				throw new AppError("Order not found", 404);
			}

			// Check if user owns this order
			if (order.userId !== userId) {
				throw new AppError("Unauthorized", 403);
			}

			// Only allow cancelling pending orders
			if (order.status !== "PENDING") {
				throw new AppError("Can only cancel pending orders", 400);
			}

			// Restore product stocks
			for (const item of order.orderItems) {
				await prisma.products.update({
					where: { id: item.productId },
					data: { stock: { increment: item.quantity } },
				});
			}

			const cancelledOrder = await orderRepository.updateStatus(
				Number(id),
				"CANCELLED",
			);

			return res.send(
				responseBuilder(200, "Order cancelled successfully", cancelledOrder),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};
}

export default new OrderController();
