import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const refreshJWTSecret = process.env.JWT_REFRESH_SECRET;
const refreshJWTExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

if (!jwtSecret || !refreshJWTSecret) {
	throw new Error(
		"JWT_SECRET or JWT_REFRESH_SECRET is not set in environment variables.",
	);
}

export type JWTType = "access" | "refresh";

export const generateJWT = (
	payload: object,
	type: JWTType = "access",
): string => {
	const secret = type === "access" ? jwtSecret : refreshJWTSecret;
	const expiresIn = type === "access" ? jwtExpiresIn : refreshJWTExpiresIn;

	return jwt.sign(payload, secret, {
		expiresIn: expiresIn || "1h",
	} as SignOptions);
};

export const verifyJWT = (token: string, type: JWTType = "access") => {
	const secret = type === "access" ? jwtSecret : refreshJWTSecret;
	return jwt.verify(token, secret);
};
