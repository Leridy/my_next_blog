import React from 'react';
import { Button, Space } from 'antd';
import { FileTextOutlined, UserSwitchOutlined, CommentOutlined, PlusOutlined } from '@ant-design/icons';
import { ConfigurationType } from '@/IndexedDB/AIChat/types';

interface FormControlsProps {
  onAdd: (type: ConfigurationType) => void;
}

const CONFIG_TYPES: {
  type: ConfigurationType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    type: 'resume',
    label: '添加简历',
    icon: <FileTextOutlined />,
    color: 'var(--color-secondary)',
  },
  {
    type: 'boss-role',
    label: '添加Boss角色',
    icon: <UserSwitchOutlined />,
    color: 'var(--color-tertiary)',
  },
  {
    type: 'prompt',
    label: '添加Prompt',
    icon: <CommentOutlined />,
    color: 'var(--color-primary)',
  },
  {
    type: 'extra',
    label: '添加额外配置',
    icon: <PlusOutlined />,
    color: 'var(--color-quaternary)',
  },
];

export const FormControls: React.FC<FormControlsProps> = ({ onAdd }) => (
  <Space
    wrap
    className="mb-4"
    style={{ gap: '12px' }}
  >
    {CONFIG_TYPES.map(({ type, label, icon, color }) => (
      <Button
        key={type}
        onClick={() => onAdd(type)}
        icon={icon}
        type="primary"
        style={{
          backgroundColor: color,
          borderColor: color,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        className="hover:opacity-90 transition-opacity"
      >
        {label}
      </Button>
    ))}
  </Space>
);
