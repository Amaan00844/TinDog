import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { config } from "../config/config.js";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt.js";
import { createTools } from "../tools/index.js";

export function createAgentExecutor(temperature?: number): AgentExecutor {
  const llm = new ChatOpenAI({
    model: config.NVIDIA_MODEL,
    apiKey: config.NVIDIA_API_KEY,
    configuration: {
      baseURL: config.NVIDIA_BASE_URL,
    },
    streaming: true,
    temperature: temperature ?? config.LLM_TEMPERATURE,
    maxTokens: config.LLM_MAX_TOKENS,
    timeout: config.LLM_TIMEOUT_MS,
  });

  const tools = createTools();
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = createToolCallingAgent({ llm, tools, prompt });

  return new AgentExecutor({
    agent,
    tools,
    maxIterations: 8,
    verbose: false,
    returnIntermediateSteps: true,
  });
}
