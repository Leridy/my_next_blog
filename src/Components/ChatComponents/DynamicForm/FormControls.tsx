import React from 'react';
import { Button, Space } from 'antd';
import { ConfigurationType } from '@/IndexedDB/HelloBoss/types';

interface FormControlsProps {
  onAdd: (type: ConfigurationType) => void;
}

const CONFIG_TYPES: { type: ConfigurationType; label: string }[] = [
  { type: 'resume', label: '添加简历' },
  { type: 'boss-role', label: '添加Boss角色' },
  { type: 'prompt', label: '添加Prompt' },
  { type: 'extra', label: '添加额外配置' },
];

export const FormControls: React.FC<FormControlsProps> = ({ onAdd }) => (
  <Space style={{ marginBottom: '16px' }}>
    {CONFIG_TYPES.map(({ type, label }) => (
      <Button
        key={type}
        onClick={() => onAdd(type)}
      >
        {label}
      </Button>
    ))}
  </Space>
);
