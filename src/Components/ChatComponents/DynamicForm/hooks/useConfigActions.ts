import { useState } from 'react';
import { message } from 'antd';
import { Configuration } from '@/IndexedDB/AIChat/types';

export const useConfigActions = (onAdd: (config: Omit<Configuration, 'id'>) => Promise<string>, onUpdate: (id: string, updates: Partial<Configuration>) => Promise<void>) => {
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  const handleSave = async (config: Configuration) => {
    try {
      if (config.id) {
        await onUpdate(config.id, {
          content: config.content,
          name: config.name,
        });
      } else {
        await onAdd(config);
      }
      message.success('保存成功');
      return true;
    } catch (error) {
      message.error('保存失败');
      console.error('Error saving configuration:', error);
      return false;
    }
  };

  return {
    editingConfig,
    setEditingConfig,
    handleSave,
  };
};
