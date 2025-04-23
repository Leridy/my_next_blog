// mockData/messages.ts
import { Message } from '../types';

export const mockMessages: Omit<Message, 'id'>[] = [
  {
    conversationId: 'conversation-1',
    createdAt: Date.now() - 3600000,
    role: 'user',
    content: '我们需要讨论下季度的产品路线图',
    status: 'sent',
    tokens: 45,
    isModified: false,
  },
  {
    conversationId: 'conversation-1',
    createdAt: Date.now() - 1800000,
    role: 'assistant',
    content: '好的，您想从哪个产品线开始讨论？',
    status: 'sent',
    tokens: 32,
    generationTime: 1200,
  },
];
