import z from "zod/v4";
import { OrderStatus } from "../generated/prisma/enums.js";

const sharedOrderSchema = {
	items: z
		.array(
			z.object({
				productId: z.number().positive("Product ID must be positive"),
				quantity: z
					.number()
					.int("Quantity must be an integer")
					.positive("Quantity must be greater than 0"),
			}),
		)
		.min(1, "Order must have at least one item"),
};

export const createOrderSchema = z.object({
	...sharedOrderSchema,
});

export const updateOrderStatusSchema = z.object({
	status: z.enum(OrderStatus),
});
