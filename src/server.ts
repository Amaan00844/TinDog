import { createApp } from "./app.js";
import { config } from "./config/config.js";
import { configureLangSmith } from "./langsmith/langsmith.js";
import { logger } from "./logger/logger.js";

configureLangSmith();

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "AI agent server listening");
});
