import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is required"),
  NVIDIA_MODEL: z.string().default("mistralai/mistral-medium-3.5-128b"),
  NVIDIA_BASE_URL: z.string().url().default("https://integrate.api.nvidia.com/v1"),

  LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.6),
  LLM_MAX_TOKENS: z.coerce.number().int().positive().default(4096),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),

  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  TAVILY_MAX_RESULTS: z.coerce.number().int().positive().default(3),

  WIKIPEDIA_TOP_K: z.coerce.number().int().positive().default(1),
  WIKIPEDIA_MAX_DOC_CONTENT_LENGTH: z.coerce.number().int().positive().default(1_500),

  LANGSMITH_TRACING: z.coerce.boolean().default(true),
  LANGSMITH_API_KEY: z.string().optional(),
  LANGSMITH_PROJECT: z.string().default("tindog-agent"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),

  RETRY_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
  RETRY_INITIAL_DELAY_MS: z.coerce.number().int().positive().default(500),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const message = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid configuration: ${message}`);
}

export const config = parsedEnvironment.data;
export type AppConfig = typeof config;
