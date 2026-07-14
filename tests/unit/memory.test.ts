import { HumanMessage } from "@langchain/core/messages";
import { describe, expect, it } from "vitest";
import { InMemoryConversationMemory } from "../../src/memory/ConversationMemory.js";

describe("InMemoryConversationMemory", () => {
  it("stores and clears messages", async () => {
    const memory = new InMemoryConversationMemory();

    await memory.appendMessages("conversation-1", [new HumanMessage("hello")]);
    expect(await memory.getMessages("conversation-1")).toHaveLength(1);

    await memory.clear("conversation-1");
    expect(await memory.getMessages("conversation-1")).toHaveLength(0);
  });
});
