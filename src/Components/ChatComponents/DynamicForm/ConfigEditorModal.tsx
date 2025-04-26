import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ConfigEditorModalProps } from './types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export const ConfigEditorModal: React.FC<ConfigEditorModalProps> = ({ config, visible, onSave, onCancel }) => {
  const [editingConfig, setEditingConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditingConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (!editingConfig) return;

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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">编辑 {editingConfig?.type} 配置</h3>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {editingConfig && (
              <div className="p-4 flex-1 overflow-auto">
                <input
                  value={editingConfig.name}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      name: e.target.value,
                    })
                  }
                  placeholder="配置名称"
                  className="w-full p-2 mb-4 border rounded"
                />
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
                  />
                </div>
              </div>
            )}

            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
