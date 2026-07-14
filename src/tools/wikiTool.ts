import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { config } from "../config/config.js";

export function createWikipediaTool(): WikipediaQueryRun {
  const tool = new WikipediaQueryRun({
    topKResults: config.WIKIPEDIA_TOP_K,
    maxDocContentLength: config.WIKIPEDIA_MAX_DOC_CONTENT_LENGTH,
  });

  tool.name = "wikipediaSearch";
  tool.description =
    "Look up stable encyclopedic knowledge, definitions, biographies, historical events, and scientific concepts.";

  return tool;
}
