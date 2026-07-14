import { StructuredToolInterface } from "@langchain/core/tools";
import { createCalculatorTool } from "./calcTool.js";
import { createSearchTool } from "./searchTool.js";
import { createWikipediaTool } from "./wikiTool.js";

export function createTools(): StructuredToolInterface[] {
  return [createSearchTool(), createWikipediaTool(), createCalculatorTool()];
}
