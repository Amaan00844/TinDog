export interface MetricsSnapshot {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  toolUsageCounts: Record<string, number>;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  llmCalls: number;
}

class MetricsService {
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private cumulativeLatencyMs = 0;
  private readonly toolUsageCounts: Record<string, number> = {};
  private readonly tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  private llmCalls = 0;

  public recordRequest(): void {
    this.totalRequests += 1;
  }

  public recordSuccess(latencyMs: number): void {
    this.successfulRequests += 1;
    this.cumulativeLatencyMs += latencyMs;
  }

  public recordFailure(latencyMs: number): void {
    this.failedRequests += 1;
    this.cumulativeLatencyMs += latencyMs;
  }

  public recordTool(name: string): void {
    this.toolUsageCounts[name] = (this.toolUsageCounts[name] ?? 0) + 1;
  }

  public recordLlmCall(): void {
    this.llmCalls += 1;
  }

  public recordTokens(tokens: Partial<MetricsSnapshot["tokenUsage"]>): void {
    this.tokenUsage.promptTokens += tokens.promptTokens ?? 0;
    this.tokenUsage.completionTokens += tokens.completionTokens ?? 0;
    this.tokenUsage.totalTokens += tokens.totalTokens ?? 0;
  }

  public snapshot(): MetricsSnapshot {
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      averageLatencyMs: this.totalRequests === 0 ? 0 : Math.round(this.cumulativeLatencyMs / this.totalRequests),
      toolUsageCounts: { ...this.toolUsageCounts },
      tokenUsage: { ...this.tokenUsage },
      llmCalls: this.llmCalls,
    };
  }
}

export const metricsService = new MetricsService();
