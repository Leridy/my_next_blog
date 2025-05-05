import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface FormControlsProps {
  onAdd: () => void;
}

export const FormControls: React.FC<FormControlsProps> = ({ onAdd }) => (
  <Space
    wrap
    className="mb-4"
    style={{ gap: '12px' }}
  >
    <Button
      onClick={() => onAdd()}
      icon={<PlusOutlined />}
      type="primary"
      style={{
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      className="hover:opacity-90 transition-opacity"
    >
      添加配置
    </Button>
  </Space>
);
