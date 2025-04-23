// mockData/configurations.ts
import { Configuration } from '../types';

export const mockConfigurations: Omit<Configuration, 'id'>[] = [
  {
    name: '默认简历模板',
    type: 'resume',
    content: {
      sections: ['education', 'workExperience', 'skills'],
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  {
    name: 'CEO角色',
    type: 'boss-role',
    content: {
      personality: '严谨果断',
      industry: '科技',
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
];
