import { Request, Response } from "express";
import { metricsService } from "../services/MetricsService.js";

export function healthController(_request: Request, response: Response): void {
  response.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

export function metricsController(_request: Request, response: Response): void {
  response.json(metricsService.snapshot());
}
