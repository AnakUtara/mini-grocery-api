import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 login requests per windowMs
	message:
		"Too many login attempts from this IP, please try again after 15 minutes",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const registerRateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 registration requests per windowMs
	message:
		"Too many registration attempts from this IP, please try again after an hour",
	standardHeaders: true,
	legacyHeaders: false,
});

export const refreshTokenRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 refresh token requests per windowMs
	message:
		"Too many token refresh attempts from this IP, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
});

export const creationRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 20, // Limit each IP to 20 creation requests per windowMs
	message: "Too many creations from this IP, please try again after a minute",
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip!), // Use user ID if available, otherwise fallback to IP address
});

export const updateRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // Limit each IP to 30 update requests per windowMs
	message: "Too many updates from this IP, please try again after a minute",
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip!), // Use user ID if available, otherwise fallback to IP address
});

export const deletionRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each IP to 10 deletion requests per windowMs
	message: "Too many deletions from this IP, please try again after a minute",
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip!), // Use user ID if available, otherwise fallback to IP address
});
