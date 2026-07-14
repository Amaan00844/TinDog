import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { createAgentExecutor } from "../agent/agentFactory.js";
import { config } from "../config/config.js";
import { SseWriter } from "../events/sse.js";
import { logger } from "../logger/logger.js";
import { conversationMemory } from "../memory/ConversationMemory.js";
import { metricsService } from "../services/MetricsService.js";
import { RequestContext } from "../types/chat.js";
import { retry } from "../utils/retry.js";

interface AgentExecutorResult {
  output?: unknown;
}

interface TokenUsageOutput {
  llmOutput?: {
    tokenUsage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
}

const GraphState = Annotation.Root({
  input: Annotation<string>(),
  history: Annotation<BaseMessage[]>({
    reducer: (_previous, next) => next,
    default: () => [],
  }),
  output: Annotation<string>({
    reducer: (_previous, next) => next,
    default: () => "",
  }),
});

function visibleToolMessage(toolName: string): string {
  if (toolName === "serpResearch") {
    return "Searching current information...";
  }

  if (toolName === "wikipediaSearch") {
    return "Looking up Wikipedia...";
  }

  if (toolName === "calculator") {
    return "Calculating...";
  }

  return "Using a tool...";
}

function createStreamingCallbacks(context: RequestContext, sse: SseWriter): BaseCallbackHandler[] {
  return [
    new (class StreamingCallbackHandler extends BaseCallbackHandler {
      public name = "sse-streaming-callback-handler";

      public async handleLLMStart(): Promise<void> {
        metricsService.recordLlmCall();
        sse.send("reasoning", { message: "Thinking..." });
      }

      public async handleLLMNewToken(token: string): Promise<void> {
        sse.send("response", { token });
      }

      public async handleToolStart(tool: { name?: string }, toolInput: string): Promise<void> {
        const toolName = tool.name ?? "tool";
        metricsService.recordTool(toolName);
        logger.info({ requestId: context.requestId, tool: toolName }, "Tool start");
        sse.send("tool_start", {
          tool: toolName,
          input: toolInput,
          message: visibleToolMessage(toolName),
        });
      }

      public async handleToolEnd(output: string): Promise<void> {
        sse.send("tool_end", {
          output: String(output).slice(0, 2_000),
        });
      }

      public async handleLLMEnd(output: unknown): Promise<void> {
        const tokenUsage = (output as TokenUsageOutput).llmOutput?.tokenUsage;

        if (tokenUsage) {
          const normalizedTokenUsage: {
            promptTokens?: number;
            completionTokens?: number;
            totalTokens?: number;
          } = {};

          if (typeof tokenUsage.promptTokens === "number") {
            normalizedTokenUsage.promptTokens = tokenUsage.promptTokens;
          }

          if (typeof tokenUsage.completionTokens === "number") {
            normalizedTokenUsage.completionTokens = tokenUsage.completionTokens;
          }

          if (typeof tokenUsage.totalTokens === "number") {
            normalizedTokenUsage.totalTokens = tokenUsage.totalTokens;
          }

          metricsService.recordTokens(normalizedTokenUsage);
        }
      }
    })(),
  ];
}

export async function runAgentGraph(
  input: string,
  context: RequestContext,
  sse: SseWriter,
  temperature?: number,
): Promise<{ output: string }> {
  const graph = new StateGraph(GraphState)
    .addNode("receive_request", async (state) => state)
    .addNode("load_memory", async (state) => ({
      ...state,
      history: await conversationMemory.getMessages(context.conversationId),
    }))
    .addNode("call_agent", async (state) => {
      const executor = createAgentExecutor(temperature);
      const callbacks = createStreamingCallbacks(context, sse);
      const result = await retry(
        () =>
          executor.invoke(
            {
              input: state.input,
              chat_history: state.history,
            },
            {
              callbacks,
              tags: context.tags,
              metadata: {
                requestId: context.requestId,
                sessionId: context.sessionId,
                userId: context.userId,
                conversationId: context.conversationId,
              },
            },
          ),
        config.RETRY_MAX_ATTEMPTS,
        config.RETRY_INITIAL_DELAY_MS,
      );

      return {
        ...state,
        output: String((result as AgentExecutorResult).output ?? ""),
      };
    })
    .addNode("execute_tools", async (state) => state)
    .addNode("save_memory", async (state) => {
      await conversationMemory.appendMessages(context.conversationId, [
        new HumanMessage(input),
        new AIMessage(state.output),
      ]);

      return state;
    })
    .addNode("return_response", async (state) => state)
    .addEdge(START, "receive_request")
    .addEdge("receive_request", "load_memory")
    .addEdge("load_memory", "call_agent")
    .addEdge("call_agent", "execute_tools")
    .addEdge("execute_tools", "save_memory")
    .addEdge("save_memory", "return_response")
    .addEdge("return_response", END)
    .compile();

  const result = await graph.invoke({ input });

  return { output: result.output };
}
