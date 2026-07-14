import { Calculator } from "@langchain/community/tools/calculator";

export function createCalculatorTool(): Calculator {
  const tool = new Calculator();
  tool.name = "calculator";
  tool.description =
    "Perform exact mathematical calculations. Use for arithmetic, percentages, statistics, unit math, and numeric computation.";

  return tool;
}
