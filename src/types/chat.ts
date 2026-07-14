import { BaseMessage } from "@langchain/core/messages";

export interface RequestContext {
  requestId: string;
  sessionId: string;
  conversationId: string;
  userId: string;
  tags: string[];
  startedAt: number;
}

export interface ChatResult {
  output: string;
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ConversationRecord {
  conversationId: string;
  messages: BaseMessage[];
  updatedAt: Date;
}

export type SseEventType =
  | "reasoning"
  | "tool_start"
  | "tool_end"
  | "response"
  | "metadata"
  | "done"
  | "error";

export interface SseEvent<T = unknown> {
  type: SseEventType;
  requestId: string;
  conversationId: string;
  timestamp: string;
  data: T;
}
