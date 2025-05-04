import React, { useRef } from 'react';
import { ConfigFormProps } from './types';
import { FormControls } from './FormControls';
import { ConfigGrid } from './ConfigGrid';
import { ConfigEditorModal, ConfigEditorModalRef } from './ConfigEditorModal';
import { useConfigActions } from './hooks/useConfigActions';
import { Configuration } from '@/IndexedDB/AIChat/types';
import { useConfigLimits } from './hooks/useConfigLimits';

export const DynamicForm: React.FC<ConfigFormProps> = ({ configurations, onAdd, onUpdate, onDelete }) => {
  const { handleSave } = useConfigActions(onAdd, onUpdate);
  const { canAddConfig } = useConfigLimits(configurations);
  const myRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<ConfigEditorModalRef>(null);

  const handleAddNew = async () => {
    const newConfig = {
      id: '',
      name: '',
      content: '',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const result = await modalRef.current?.open(newConfig);
    if (result && canAddConfig(result.type)) {
      await handleSave(result);
    }
  };

  const handleEdit = async (config: Configuration) => {
    const result = await modalRef.current?.open(config);
    if (result) {
      await handleSave(result);
    }
  };

  return (
    <div
      className="p-4 h-full display-flex flex-col"
      ref={myRef}
    >
      <FormControls onAdd={handleAddNew} />

      <ConfigGrid
        configurations={configurations}
        onEdit={handleEdit}
        onDelete={onDelete}
      />

      <ConfigEditorModal
        pRef={myRef}
        ref={modalRef}
      />
    </div>
  );
};
