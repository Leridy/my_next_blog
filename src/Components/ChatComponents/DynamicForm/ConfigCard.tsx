import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ConfigCardProps } from './types';
import { DeleteOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown), { ssr: false });

export const ConfigCard: React.FC<ConfigCardProps> = ({ config, onEdit, onDelete }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    className="h-full"
  >
    <div className="bg-[var(--color-card-background)] rounded-lg shadow-md h-full flex flex-col overflow-hidden border border-[var(--color-border)] transition-all duration-200 hover:border-[var(--color-secondary)]">
      <div className="p-2 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-quaternary)]">
        <h3 className="font-medium text-[var(--color-text)] truncate text-lg">{config.name}</h3>
        <div className="flex space-x-3">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-[var(--color-secondary)] hover:text-[var(--color-tertiary)] transition-colors"
            aria-label="Edit"
          >
            <SettingOutlined />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete"
          >
            <DeleteOutlined />
          </motion.button>
        </div>
      </div>

      <div className="p-2 flex-1 overflow-hidden prose max-w-none ">
        {config.content ? (
          <MDEditor
            className="rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm p-2"
            style={{
              backgroundColor: 'var(--color-editor-background)',
              color: 'var(--color-editor-text)',
            }}
            source={config.content.substring(0, 100) + (config.content.length > 100 ? '...' : '')}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)">
            <FileTextOutlined className="text-4xl mb-2" />
            <p className="text-sm">No content available</p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);
