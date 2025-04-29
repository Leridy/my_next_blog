import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ConfigEditorModalProps } from './types';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export const ConfigEditorModal: React.FC<ConfigEditorModalProps> = ({ config, visible, onSave, onCancel }) => {
  const [editingConfig, setEditingConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditingConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (!editingConfig?.name.trim()) return;

    setIsSaving(true);
    const success = await onSave(editingConfig);
    setIsSaving(false);

    if (success) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-[var(--color-card-background)] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-quaternary)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">编辑 {editingConfig?.type} 配置</h3>
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Close"
              >
                <CloseOutlined />
              </motion.button>
            </div>

            {editingConfig && (
              <div className="p-4 flex-1 overflow-auto">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">配置名称</label>
                  <input
                    value={editingConfig.name}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        name: e.target.value,
                      })
                    }
                    placeholder="输入配置名称"
                    className="w-full p-2 border border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="h-[400px]">
                  <MDEditor
                    value={editingConfig.content}
                    onChange={(value) =>
                      setEditingConfig({
                        ...editingConfig,
                        content: value || '',
                      })
                    }
                    height="100%"
                    className="border border-[var(--color-border)] rounded overflow-hidden"
                  />
                </div>
              </div>
            )}

            <div className="p-4 border-t border-[var(--color-border)] flex justify-end space-x-3">
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-transparent-background)] transition-colors"
              >
                取消
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving || !editingConfig?.name.trim()}
                whileHover={{ scale: !isSaving ? 1.02 : 1 }}
                whileTap={{ scale: !isSaving ? 0.98 : 1 }}
                className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-text-light)] rounded hover:bg-[var(--color-tertiary)] disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
              >
                {isSaving ? (
                  <>
                    <LoadingOutlined className="mr-2 animate-spin" />
                    保存中
                  </>
                ) : (
                  '保存'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
