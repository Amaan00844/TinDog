import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import { config } from "./config/config.js";
import { logger } from "./logger/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);
  app.use(healthRouter);
  app.use(chatRouter);
  app.use(errorHandler);

  return app;
}
