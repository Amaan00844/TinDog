export type ErrorCode =
  | "VALIDATION_ERROR"
  | "TOOL_TIMEOUT"
  | "LLM_TIMEOUT"
  | "STREAMING_ERROR"
  | "UNEXPECTED_ERROR";

export class AppError extends Error {
  public constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationAppError extends AppError {
  public constructor(details: unknown) {
    super("VALIDATION_ERROR", "Request validation failed", 400, details);
  }
}
