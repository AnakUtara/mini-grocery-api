import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.client.js";
import { verifyJWT } from "../libs/jwt.js";
import AppError from "../errors/app.error.js";
import { Role, type User } from "../generated/prisma/client.js";
import { cookieConfig } from "../config/app.config.js";

export const uniqueUserGuard = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	try {
		const { email } = req.body;
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (user) throw new AppError("User already exists", 400);
		next();
	} catch (error) {
		next(error);
	}
};

export const adminGuard = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	try {
		if (!req.user) throw new AppError("User not authenticated", 401);
		if (req.user.role !== Role.ADMIN)
			throw new AppError("Access denied: Admins only", 403);
		next();
	} catch (error) {
		next(error);
	}
};

export const verifyAccessToken = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) throw new AppError("Authorization header missing", 401);
		const token = authHeader.split(" ")[1];
		if (!token) throw new AppError("Unauthorized", 401);
		const decoded = verifyJWT(token);
		req.user = decoded as User;
		next();
	} catch (error) {
		next(error);
	}
};

export const verifyRefreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const refreshToken = req.cookies["refresh-token"];
		if (!refreshToken) throw new AppError("Unauthorized", 401);

		const decoded = verifyJWT(refreshToken, "refresh");

		req.user = decoded as User;

		const existingValidToken = await prisma.refreshToken.findUnique({
			where: { token: refreshToken, userId: req.user.id },
		});

		if (!existingValidToken) {
			await prisma.refreshToken.deleteMany({
				where: { userId: req.user.id },
			});

			res.clearCookie("refresh-token", cookieConfig);

			throw new AppError("Token Replay Attack detected", 403);
		}

		next();
	} catch (error) {
		next(error);
	}
};
