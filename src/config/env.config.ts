import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
	console.warn("DATABASE_URL is not set. Please set it in your environment.");
}

const appName = process.env.APP_NAME || "Blog API";
const appPort = process.env.APP_PORT || 8000;
const appEnv = process.env.APP_ENV || "development";

const isProduction = appEnv === "production";

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export { appName, appPort, appEnv, databaseUrl, isProduction, clientOrigin };
