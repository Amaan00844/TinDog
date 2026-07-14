import { describe, expect, it } from "vitest";
import { chatRequestSchema } from "../../src/schemas/chatSchemas.js";

describe("chatRequestSchema", () => {
  it("validates chat payloads", () => {
    const parsed = chatRequestSchema.parse({ query: "Hi", userId: "user-1" });

    expect(parsed.query).toBe("Hi");
    expect(parsed.userId).toBe("user-1");
  });

  it("rejects an empty query", () => {
    expect(() => chatRequestSchema.parse({ query: "" })).toThrow();
  });
});
