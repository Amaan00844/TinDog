export type StreamEventType =
  | "reasoning"
  | "tool_start"
  | "tool_end"
  | "response"
  | "metadata"
  | "done"
  | "error";

export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  requestId: string;
  conversationId: string;
  timestamp: string;
  data: T;
}

export interface ChatRequestPayload {
  query: string;
  conversationId?: string;
  userId: string;
  tags?: string[];
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}

export function parseSseChunk(chunk: string): StreamEvent[] {
  return chunk
    .split("\n\n")
    .map((frame) => frame.trim())
    .filter(Boolean)
    .map((frame) => {
      const dataLine = frame
        .split("\n")
        .find((line) => line.startsWith("data: "));

      if (!dataLine) {
        return null;
      }

      try {
        return JSON.parse(dataLine.slice(6)) as StreamEvent;
      } catch {
        return null;
      }
    })
    .filter((event): event is StreamEvent => event !== null);
}
