import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../logger/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  logger.error({ err: error }, "Unexpected request error");
  response.status(500).json({
    error: {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error",
    },
  });
};
