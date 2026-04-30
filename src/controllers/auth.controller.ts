import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.client.js";
import { comparePassword, hashPassword } from "../libs/bcrypt.js";
import { generateJWT } from "../libs/jwt.js";
import { responseBuilder } from "../utils/response.builder.js";
import { authSchema } from "../validations/auth.validation.js";
import AppError from "../errors/app.error.js";
import { cookieConfig } from "../config/app.config.js";
import type { User } from "../generated/prisma/client.js";

class AuthController {
	register = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body;

			const validAuth = await authSchema.parseAsync({
				email,
				password,
			});

			const hashedPassword = await hashPassword(validAuth.password);

			if (!hashedPassword) {
				throw new AppError("Error hashing password", 500);
			}

			await prisma.user.create({
				data: {
					email: validAuth.email,
					password: hashedPassword,
					// Role defaults to CUSTOMER at database level
				},
			});

			return res
				.status(201)
				.send(responseBuilder(201, "User registered successfully", null));
		} catch (error: Error | any) {
			next(error);
		}
	};

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body;

			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (!existingUser) {
				throw new AppError("Invalid email or password", 401);
			}

			await prisma.refreshToken.deleteMany({
				where: { userId: existingUser.id },
			});

			const isPasswordValid = await comparePassword(
				password,
				existingUser.password!,
			);

			if (!isPasswordValid) {
				throw new AppError("Invalid email or password", 401);
			}

			const { password: p, ...user } = existingUser; // Exclude password from user object

			const accessToken = generateJWT({
				id: existingUser.id,
				email: existingUser.email,
				role: existingUser.role,
			});

			const refreshToken = generateJWT(
				{
					id: existingUser.id,
					email: existingUser.email,
					role: existingUser.role,
				},
				"refresh",
			);

			await prisma.refreshToken.create({
				data: {
					token: refreshToken,
					userId: existingUser.id,
				},
			});

			return res.cookie("refresh-token", refreshToken, cookieConfig).send(
				responseBuilder(200, "Login successful", {
					user,
					accessToken,
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const refreshToken = req.cookies["refresh-token"];
			if (refreshToken) {
				await prisma.refreshToken.deleteMany({
					where: { token: refreshToken },
				});
			}
			res.clearCookie("refresh-token", cookieConfig);
			return res.send(responseBuilder(200, "Logout successful", null));
		} catch (error: Error | any) {
			next(error);
		}
	};

	getAuthUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) throw new AppError("User not authenticated", 401);

			const user = await prisma.user.findUnique({
				where: { id: req.user.id },
				select: {
					id: true,
					email: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!user) throw new AppError("User not found", 404);

			return res.send(responseBuilder(200, "Success", user));
		} catch (error: Error | any) {
			next(error);
		}
	};

	refreshToken = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) throw new AppError("User not authenticated", 401);

			const { id, email } = req.user as User;

			const user = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!user) throw new AppError("User not found", 404);

			const newAccessToken = generateJWT({
				id,
				email,
				role: user.role,
			});
			const newRefreshToken = generateJWT(
				{
					id,
					email,
					role: user.role,
				},
				"refresh",
			);

			console.log(
				"old refresh token:",
				req.cookies["refresh-token"],
				"user id:",
				id,
			);

			await prisma.refreshToken.update({
				where: { token: req.cookies["refresh-token"], userId: id },
				data: {
					token: newRefreshToken,
				},
			});

			return res.cookie("refresh-token", newRefreshToken, cookieConfig).send(
				responseBuilder(200, "Token refreshed successfully", {
					user,
					accessToken: newAccessToken,
				}),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};

	// ✅ Promote user to ADMIN (Admin only)
	promoteUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.params;
			const requesterId = (req as any).user?.id;
			const requesterRole = (req as any).user?.role;

			// Check if requester is admin
			if (requesterRole !== "ADMIN") {
				throw new AppError("Unauthorized - Admin access required", 403);
			}

			// Prevent self-demotion scenarios
			if (Number(userId) === requesterId) {
				throw new AppError("Cannot promote yourself", 400);
			}

			const user = await prisma.user.update({
				where: { id: Number(userId) },
				data: { role: "ADMIN" },
				select: {
					id: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			return res.send(
				responseBuilder(200, "User promoted to ADMIN successfully", user),
			);
		} catch (error: Error | any) {
			next(error);
		}
	};
}

export default new AuthController();
