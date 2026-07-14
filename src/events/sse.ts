import { Response } from "express";
import { RequestContext, SseEvent, SseEventType } from "../types/chat.js";

export class SseWriter {
  public constructor(
    private readonly response: Response,
    private readonly context: RequestContext,
  ) {}

  public init(): void {
    this.response.setHeader("Content-Type", "text/event-stream");
    this.response.setHeader("Cache-Control", "no-cache, no-transform");
    this.response.setHeader("Connection", "keep-alive");
    this.response.flushHeaders?.();
    this.send("metadata", {
      sessionId: this.context.sessionId,
      tags: this.context.tags,
    });
  }

  public send<T>(type: SseEventType, data: T): void {
    if (this.response.writableEnded) {
      return;
    }

    const payload: SseEvent<T> = {
      type,
      requestId: this.context.requestId,
      conversationId: this.context.conversationId,
      timestamp: new Date().toISOString(),
      data,
    };

    this.response.write(`event: ${type}\n`);
    this.response.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  public end(): void {
    this.send("done", { ok: true });
    this.response.end();
  }
}
