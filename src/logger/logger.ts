import pino from "pino";
import { config } from "../config/config.js";

export const logger = pino({
  level: config.NODE_ENV === "test" ? "silent" : "info",
  redact: [
    "req.headers.authorization",
    "NVIDIA_API_KEY",
    "TAVILY_API_KEY",
    "LANGSMITH_API_KEY",
    "*.apiKey",
  ],
  transport:
    config.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
