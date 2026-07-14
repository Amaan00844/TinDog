# TinDog Production AI Agent Backend

A production-ready TypeScript/Node.js Express backend for a streaming LangChain tool-calling agent using NVIDIA's OpenAI-compatible API, LangGraph orchestration, LangSmith tracing, Tavily search, Wikipedia, calculator, validation, memory, logging, metrics, Docker, and tests.

## Architecture

```text
Frontend
  ↓ SSE / POST /chat
Express Server
  ↓
Request Validation (Zod)
  ↓
Conversation Manager (replaceable in-memory store)
  ↓
LangSmith Trace + metadata/tags
  ↓
LangGraph Workflow
  ↓
Tool Calling Agent (createToolCallingAgent + AgentExecutor)
  ↓
Tools: Tavily Search, Wikipedia, Calculator
  ↓
SSE Streaming Response
  ↓
Client
```

## Folder Structure

- `src/agent` — LangChain agent factory.
- `src/graph` — LangGraph workflow wrapper.
- `src/tools` — Modular Tavily, Wikipedia, and calculator tools.
- `src/prompts` — System prompt.
- `src/memory` — Conversation memory abstraction and in-memory implementation.
- `src/langsmith` — LangSmith tracing setup.
- `src/services` — Metrics service.
- `src/config` — Central validated configuration.
- `src/middleware` — Rate limiting and error handling.
- `src/routes` / `src/controllers` — HTTP API.
- `src/schemas` — Zod request schemas.
- `src/events` — SSE writer.
- `src/logger` — Pino logging.
- `src/errors` — Custom errors.

## Installation

```bash
npm install
cp .env.example .env
```

Fill in `NVIDIA_API_KEY`, `TAVILY_API_KEY`, and optionally `LANGSMITH_API_KEY`.

## Environment Variables

See `.env.example` for all configuration. Model, temperature, max tokens, timeouts, retry settings, rate limits, tool sizes, LangSmith project, and CORS origin are configurable.

## Running

```bash
npm run dev
npm run build
npm start
```

## Development

```bash
npm test
```

## Production

Use `npm run build` then `npm start`, or Docker Compose.

## LangSmith Setup

Set:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_key
LANGSMITH_PROJECT=tindog-agent
```

Every agent invocation includes request ID, session ID, conversation ID, user ID, tags, tool calls, latency, errors, and token usage when returned by the provider.

## NVIDIA Setup

Set:

```env
NVIDIA_API_KEY=your_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=mistralai/mistral-medium-3.5-128b
```

The backend uses `ChatOpenAI` with NVIDIA's OpenAI-compatible endpoint.

## Tavily Setup

Set:

```env
TAVILY_API_KEY=your_key
TAVILY_MAX_RESULTS=3
```

## API

### POST `/chat`

Streams SSE.

Request:

```json
{"query":"What is NVIDIA's latest AI news?","userId":"user-123","tags":["demo"]}
```

### POST `/memory/clear`

```json
{"conversationId":"00000000-0000-4000-8000-000000000000"}
```

### GET `/health`

Returns service health.

### GET `/metrics`

Returns total requests, successes, failures, average latency, tool counts, token usage, and LLM calls.

## SSE Event Format

Each event is JSON and uses one of:

- `reasoning`
- `tool_start`
- `tool_end`
- `response`
- `metadata`
- `done`
- `error`

Example:

```text
event: response
data: {"type":"response","requestId":"...","conversationId":"...","timestamp":"...","data":{"token":"Hello"}}
```

## Deployment

```bash
docker compose up --build
```

## Troubleshooting

- Invalid configuration: verify `.env` and required API keys.
- No streaming: ensure the proxy disables response buffering.
- Tool errors: verify Tavily key and outbound network access.
- LangSmith missing traces: verify `LANGSMITH_API_KEY` and project name.

## Next.js Frontend

A polished animated Next.js UI lives in `web/`. It provides:

- A glassmorphism landing page for the production agent.
- Animated aurora gradients, floating tool chips, and streaming message transitions.
- A chat composer that posts to the Express `/chat` endpoint and parses the SSE stream from `reasoning`, `tool_start`, `tool_end`, `response`, `metadata`, `done`, and `error` events.
- Configurable backend URL via `NEXT_PUBLIC_API_BASE_URL`.

### Running the UI

```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

The default UI runs at `http://localhost:3000` and expects the backend at `http://localhost:3001`.

### Full Stack Docker Compose

```bash
docker compose up --build
```

This starts:

- `ai-agent-api` on port `3001`.
- `ai-agent-ui` on port `3000`.
