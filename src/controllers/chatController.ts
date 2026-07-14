import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { ValidationAppError } from "../errors/AppError.js";
import { SseWriter } from "../events/sse.js";
import { runAgentGraph } from "../graph/agentGraph.js";
import { logger } from "../logger/logger.js";
import { conversationMemory } from "../memory/ConversationMemory.js";
import { chatRequestSchema, clearMemorySchema } from "../schemas/chatSchemas.js";
import { metricsService } from "../services/MetricsService.js";

export async function chatController(request: Request, response: Response): Promise<void> {
  const parsedRequest = chatRequestSchema.safeParse(request.body);

  if (!parsedRequest.success) {
    throw new ValidationAppError(parsedRequest.error.flatten());
  }

  const body = parsedRequest.data;
  const context = {
    requestId: randomUUID(),
    sessionId: randomUUID(),
    conversationId: body.conversationId ?? randomUUID(),
    userId: body.userId,
    tags: body.tags,
    startedAt: Date.now(),
  };

  metricsService.recordRequest();
  logger.info(
    {
      requestId: context.requestId,
      conversationId: context.conversationId,
      userId: context.userId,
      promptLength: body.query.length,
    },
    "Incoming chat request",
  );

  const sse = new SseWriter(response, context);
  sse.init();

  try {
    const result = await runAgentGraph(body.query, context, sse, body.temperature);
    const latencyMs = Date.now() - context.startedAt;
    sse.send("metadata", {
      latencyMs,
      outputLength: result.output.length,
    });
    metricsService.recordSuccess(latencyMs);
    sse.end();
  } catch (error) {
    const latencyMs = Date.now() - context.startedAt;
    metricsService.recordFailure(latencyMs);
    logger.error({ err: error, requestId: context.requestId }, "Chat failed");
    sse.send("error", {
      message: error instanceof Error ? error.message : "Unexpected error",
    });
    response.end();
  }
}

export async function clearMemoryController(request: Request, response: Response): Promise<void> {
  const parsedRequest = clearMemorySchema.safeParse(request.body);

  if (!parsedRequest.success) {
    throw new ValidationAppError(parsedRequest.error.flatten());
  }

  await conversationMemory.clear(parsedRequest.data.conversationId);
  response.json({ ok: true, conversationId: parsedRequest.data.conversationId });
}
