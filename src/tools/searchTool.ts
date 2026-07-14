import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { config } from "../config/config.js";

export function createSearchTool(): TavilySearchResults {
  const tool = new TavilySearchResults({
    maxResults: config.TAVILY_MAX_RESULTS,
    apiKey: config.TAVILY_API_KEY,
  });

  tool.name = "serpResearch";
  tool.description =
    "Search current web results, recent news, real-time information, and facts that may have changed. Returns sources and snippets.";

  return tool;
}
