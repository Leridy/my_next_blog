// mockData/conversations.ts
import { Conversation } from '../types';

export const mockConversations: Omit<Conversation, 'id'>[] = [
  {
    configId: 'config-1',
    title: '产品需求讨论',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    isPinned: true,
    isArchived: false,
    lastMessage: '我觉得这个功能可以这样实现...',
    messageCount: 12,
    tags: ['产品', '需求'],
    modelUsed: 'gpt-4',
  },
  {
    configId: 'config-2',
    title: '技术方案评审',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
    isPinned: false,
    isArchived: false,
    lastMessage: '这个架构设计有几个潜在问题...',
    messageCount: 8,
    tags: ['技术', '架构'],
    modelUsed: 'claude-2',
  },
];
