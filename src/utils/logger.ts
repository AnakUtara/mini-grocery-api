import { createLogger, format, transports } from "winston";
import path from "path";
import { isProduction } from "../config/env.config.js";

const logFormat = format.printf(
	({ level, message, timestamp, ...metadata }) => {
		// Check if there's extra stuff (like statusCode, method, etc.)
		const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : "";

		// This matches their slide format: Timestamp [LEVEL]: Message {metadata}
		return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
	},
);

const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.errors({ stack: true }), // Include stack trace for errors
		format.splat(),
		format.json(),
		logFormat,
	),
	transports: [
		new transports.File({
			filename: path.join(process.cwd(), "src/logs/error.log"),
			level: "error",
		}),
		new transports.File({
			filename: path.join(process.cwd(), "src/logs/combined.log"),
		}),
	],
});

if (!isProduction) {
	logger.add(
		new transports.Console({
			format: format.combine(format.colorize(), logFormat),
		}),
	);
}

export default logger;
