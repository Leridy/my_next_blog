// mockData/configurations.ts
import { Configuration } from '../types';

export const mockConfigurations: Omit<Configuration, 'id'>[] = [
  {
    name: '默认简历模板',
    type: 'resume',
    content: '',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  {
    name: 'CEO角色',
    type: 'boss-role',
    content: '{"name":"CEO","description":"负责公司整体战略和决策"}',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
];
