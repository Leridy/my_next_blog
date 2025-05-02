// index.tsx
import React, { useState } from 'react';
import { ConfigFormProps } from './types';
import { FormControls } from './FormControls';
import { ConfigGrid } from './ConfigGrid';
import { ConfigEditorModal } from './ConfigEditorModal';
import { useConfigActions } from './hooks/useConfigActions';
import { useConfigLimits } from './hooks/useConfigLimits';
import { Configuration, ConfigurationType } from '@/IndexedDB/AIChat/types';

export const DynamicForm: React.FC<ConfigFormProps> = ({ configurations, onAdd, onUpdate, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { canAddConfig } = useConfigLimits(configurations);
  const { editingConfig, setEditingConfig, handleSave } = useConfigActions(onAdd, onUpdate);

  const handleAddNew = (type: ConfigurationType) => {
    if (!canAddConfig(type)) return;

    setEditingConfig({
      id: '',
      name: `${type}配置`,
      type,
      content: '',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (config: Configuration) => {
    setEditingConfig(config);
    setIsModalVisible(true);
  };

  return (
    <div className="p-4 h-full display-flex flex-col">
      <FormControls onAdd={handleAddNew} />

      <ConfigGrid
        configurations={configurations}
        onEdit={handleEdit}
        onDelete={onDelete}
      />

      <ConfigEditorModal
        config={editingConfig}
        visible={isModalVisible}
        onSave={handleSave}
        onCancel={() => setIsModalVisible(false)}
      />
    </div>
  );
};
