import { z } from "zod";

export const chatRequestSchema = z.object({
  query: z.string().trim().min(1).max(10_000),
  conversationId: z.string().uuid().optional(),
  userId: z.string().trim().min(1).max(200).default("anonymous"),
  temperature: z.number().min(0).max(2).optional(),
  tags: z.array(z.string().min(1).max(64)).max(10).default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const clearMemorySchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().trim().min(1).max(200).optional(),
});
