import { ChatExperience } from "../components/ChatExperience";

const capabilities = [
  "NVIDIA OpenAI-compatible streaming",
  "LangGraph orchestration",
  "Tavily, Wikipedia, Calculator tools",
  "LangSmith-ready tracing metadata",
];

export default function Home(): JSX.Element {
  return (
    <main className="page">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Production AI Agent UI</p>
          <h1>Beautiful streaming chat for your LangChain backend.</h1>
          <p className="hero-text">
            A polished Next.js interface with animated gradients, live SSE parsing, status updates,
            and a glassmorphism chat surface designed to connect directly to the Express agent API.
          </p>
          <div className="capabilities">
            {capabilities.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="pulse-ring" />
          <div className="agent-core">
            <span>AI</span>
          </div>
          <div className="tool-chip chip-search">Search</div>
          <div className="tool-chip chip-wiki">Wiki</div>
          <div className="tool-chip chip-calc">Calc</div>
        </div>
      </section>
      <ChatExperience />
    </main>
  );
}
