import z from "zod/v4";

const sharedCategorySchema = {
	name: z
		.string()
		.trim()
		.min(2, "Category name must be at least 2 characters")
		.max(100, "Category name must be at most 100 characters"),
};

export const createCategorySchema = z.object({
	...sharedCategorySchema,
});

export const updateCategorySchema = z
	.object({
		...sharedCategorySchema,
	})
	.partial();
