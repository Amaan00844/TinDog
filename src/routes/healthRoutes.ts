import { Router } from "express";
import { healthController, metricsController } from "../controllers/healthController.js";

export const healthRouter = Router();

healthRouter.get("/health", healthController);
healthRouter.get("/metrics", metricsController);
