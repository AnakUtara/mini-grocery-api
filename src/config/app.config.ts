import express from "express";
import type { Application, CookieOptions } from "express";
import { appPort, isProduction } from "./env.config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "../middlewares/express/cors.js";

const app: Application = express();
const PORT = appPort;

//Middleware Configuration
app.set("trust proxy", 1); // Trust first proxy (if behind a reverse proxy like Nginx or Heroku)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

const cookieConfig: CookieOptions = {
	httpOnly: true,
	sameSite: isProduction ? "none" : "lax",
	secure: isProduction,
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default app;
export { PORT, cookieConfig };
