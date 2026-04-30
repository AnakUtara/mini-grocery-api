import z from "zod/v4";

const sharedAuthSchema = {
	email: z
		.string()
		.regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format")
		.min(5, "Email must be at least 5 characters")
		.max(255, "Email must be at most 255 characters"),
	password: z
		.string()
		.regex(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
			"Password must be at least 6 characters and contain at least one letter and one number",
		),
};

export const authSchema = z.object({
	...sharedAuthSchema,
});
