"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { ChatRequestPayload, getApiBaseUrl, parseSseChunk, StreamEvent } from "../lib/sse";

interface Message {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
}

function createId(): string {
  return crypto.randomUUID();
}

function getEventText(event: StreamEvent): string {
  if (event.type === "response") {
    const data = event.data as { token?: string; content?: string };
    return data.token ?? data.content ?? "";
  }

  if (event.type === "reasoning" || event.type === "tool_start") {
    const data = event.data as { message?: string; tool?: string };
    return data.message ?? data.tool ?? "Working...";
  }

  if (event.type === "error") {
    const data = event.data as { message?: string };
    return data.message ?? "The agent encountered an error.";
  }

  return "";
}

export function ChatExperience(): JSX.Element {
  const [query, setQuery] = useState("What are the latest NVIDIA AI announcements? Summarize with sources.");
  const [userId, setUserId] = useState("demo-user");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Ready");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!query.trim() || isStreaming) {
      return;
    }

    const assistantId = createId();
    const payload: ChatRequestPayload = {
      query: query.trim(),
      conversationId,
      userId: userId.trim() || "anonymous",
      tags: ["next-ui"],
    };

    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", content: payload.query },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setQuery("");
    setStatus("Connecting to agent...");
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const eventFrame of parseSseChunk(frames.join("\n\n"))) {
          const text = getEventText(eventFrame);

          if (eventFrame.conversationId) {
            setConversationId(eventFrame.conversationId);
          }

          if (eventFrame.type === "response" && text) {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + text }
                  : message,
              ),
            );
          }

          if (eventFrame.type === "reasoning" || eventFrame.type === "tool_start") {
            setStatus(text);
          }

          if (eventFrame.type === "error") {
            setStatus("Agent error");
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? { ...message, content: text } : message,
              ),
            );
          }

          if (eventFrame.type === "done") {
            setStatus("Complete");
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setStatus("Connection failed");
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: error instanceof Error ? error.message : "Unknown error" }
              : message,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  function stopStreaming(): void {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStatus("Stopped");
  }

  return (
    <section className="chat-shell" aria-label="AI agent chat">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Live LangGraph Agent</p>
          <h2>Ask the research copilot</h2>
        </div>
        <span className={isStreaming ? "status status-live" : "status"}>{status}</span>
      </div>

      <div className="messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="orb" />
            <h3>Streaming, tool-aware answers</h3>
            <p>
              Try current events, factual lookups, or calculations. The UI listens to reasoning,
              tool, response, metadata, done, and error events from the Express SSE endpoint.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`message message-${message.role}`}>
              <span>{message.role === "user" ? "You" : "Agent"}</span>
              <p>{message.content || (message.role === "assistant" ? "Streaming..." : "")}</p>
            </article>
          ))
        )}
      </div>

      <form className="composer" onSubmit={submit}>
        <label>
          <span>User ID</span>
          <input value={userId} onChange={(event) => setUserId(event.target.value)} />
        </label>
        <label className="prompt-input">
          <span>Prompt</span>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask the agent anything..."
            rows={3}
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={isStreaming || !query.trim()}>
            {isStreaming ? "Streaming..." : "Send"}
          </button>
          <button type="button" className="secondary" onClick={stopStreaming} disabled={!isStreaming}>
            Stop
          </button>
        </div>
      </form>
    </section>
  );
}
