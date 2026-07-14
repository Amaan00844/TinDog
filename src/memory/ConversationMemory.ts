import { BaseMessage } from "@langchain/core/messages";

export interface ConversationMemory {
  getMessages(conversationId: string): Promise<BaseMessage[]>;
  appendMessages(conversationId: string, messages: BaseMessage[]): Promise<void>;
  clear(conversationId: string): Promise<void>;
}

export class InMemoryConversationMemory implements ConversationMemory {
  private readonly store = new Map<string, BaseMessage[]>();

  public async getMessages(conversationId: string): Promise<BaseMessage[]> {
    return [...(this.store.get(conversationId) ?? [])];
  }

  public async appendMessages(conversationId: string, messages: BaseMessage[]): Promise<void> {
    this.store.set(conversationId, [...(this.store.get(conversationId) ?? []), ...messages]);
  }

  public async clear(conversationId: string): Promise<void> {
    this.store.delete(conversationId);
  }
}

export const conversationMemory = new InMemoryConversationMemory();
