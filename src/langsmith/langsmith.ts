import { config } from "../config/config.js";

export function configureLangSmith(): void {
  process.env.LANGCHAIN_TRACING_V2 = String(config.LANGSMITH_TRACING);
  process.env.LANGCHAIN_PROJECT = config.LANGSMITH_PROJECT;

  if (config.LANGSMITH_API_KEY) {
    process.env.LANGCHAIN_API_KEY = config.LANGSMITH_API_KEY;
  }
}
