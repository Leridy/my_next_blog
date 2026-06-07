// mockData/preferences.ts
import { Preference } from '../types';

export const mockPreferences: Omit<Preference, 'updatedAt'>[] = [
  {
    userId: 'default-user',
    key: 'theme',
    value: 'dark',
  },
  {
    userId: 'default-user',
    key: 'fontSize',
    value: 14,
  },
];
