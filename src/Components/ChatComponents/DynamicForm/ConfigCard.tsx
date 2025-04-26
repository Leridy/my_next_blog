// ConfigCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ConfigCardProps } from './types';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown), { ssr: false });

export const ConfigCard: React.FC<ConfigCardProps> = ({ config, onEdit, onDelete }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
    className="h-full"
  >
    <div className="bg-[var(--color-card-background)] rounded-lg shadow-md h-full flex flex-col overflow-hidden border border-[var(--color-border)]">
      <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 className="font-medium text-[var(--color-text)] truncate">{config.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-[var(--color-secondary)] hover:text-[var(--color-tertiary)] transition-colors"
          >
            <SettingOutlined />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-hidden prose max-w-none">
        <MDEditor source={config.content.substring(0, 100) + (config.content.length > 100 ? '...' : '')} />
      </div>
    </div>
  </motion.div>
);
