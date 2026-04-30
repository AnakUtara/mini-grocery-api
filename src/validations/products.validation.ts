import z from "zod/v4";

const sharedProductSchema = {
	title: z
		.string()
		.trim()
		.min(2, "Product title must be at least 2 characters")
		.max(255, "Product title must be at most 255 characters"),
	description: z
		.string()
		.trim()
		.max(1000, "Description must be at most 1000 characters")
		.optional(),
	price: z.number().positive("Price must be greater than 0"),
	stock: z
		.number()
		.int("Stock must be an integer")
		.min(0, "Stock cannot be negative"),
	thumbnailUrl: z.url("Invalid image URL").optional(),
};

export const createProductSchema = z.object({
	...sharedProductSchema,
	categoryIds: z.array(z.number()).optional(),
});

export const updateProductSchema = z
	.object({
		...sharedProductSchema,
		categoryIds: z.array(z.number()).optional(),
	})
	.partial();

export const updateStockSchema = z.object({
	newStock: z
		.number()
		.int("Stock must be an integer")
		.min(0, "Stock cannot be negative"),
	notes: z.string().optional(),
});
