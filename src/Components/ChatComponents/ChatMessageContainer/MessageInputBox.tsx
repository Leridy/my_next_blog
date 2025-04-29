import React, { useState, useRef, useEffect } from 'react';
import { Button, message as antdMessage, Space } from 'antd';
import dynamic from 'next/dynamic';
import { Configuration, ConfigurationType, Conversation, MessageStatus } from '@/IndexedDB/HelloBoss/types';
import { FullscreenExitOutlined, FullscreenOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export interface MessageInputBoxProps {
  currentConversationId?: Conversation['id'];
  configurations?: Configuration[];
  status?: MessageStatus;
  sendMessage: (message: string) => Promise<void>;
  requiredConfigTypes?: ConfigurationType[];
  onCreateConversation?: (title: string) => void;
}

const MessageInputBox = (props: MessageInputBoxProps) => {
  const { currentConversationId, configurations = [], status, sendMessage, requiredConfigTypes = [], onCreateConversation } = props;
  const [value, setValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSend();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value]);

  const handleSend = async () => {
    if (!value.trim()) return;

    const missingConfigs = requiredConfigTypes.filter((type) => !configurations.some((c) => c.type === type));
    if (missingConfigs.length > 0) {
      antdMessage.error(`缺少必要配置: ${missingConfigs.join(', ')}`);
      return;
    }

    try {
      await sendMessage(value);
      setValue('');
    } catch (error) {
      antdMessage.error(`发送失败 ${(error as Error).message}`);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCreateConversation = () => {
    onCreateConversation?.('新会话');
  };

  return (
    <div className={` p-4 bg-[var(--color-background)] ${isFullscreen ? 'fixed inset-0 z-50  ' : ''}`}>
      <div className="relative transition-all duration-300">
        <MDEditor
          value={value}
          // @ts-ignore
          onChange={setValue}
          preview="edit"
          resizable={false}
          ref={editorRef}
          height={isFullscreen ? 'calc(100vh - 120px)' : 200}
          className="rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
          style={{
            backgroundColor: 'var(--color-editor-background)',
            color: 'var(--color-editor-text)',
          }}
        />
        <div className="flex justify-between mt-3">
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            type="text"
            size="small"
            className="text-[var(--color-text)] hover:bg-[var(--color-primary)]"
          />

          <Space>
            <Button
              type="primary"
              onClick={handleCreateConversation}
              loading={status === 'pending'}
              disabled={status === 'pending'}
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-tertiary)] text-[var(--color-text-light)]"
              icon={<PlusOutlined />}
            >
              新会话
            </Button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                onClick={handleSend}
                loading={status === 'pending'}
                disabled={!value.trim() || status === 'pending' || !currentConversationId}
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-tertiary)] text-[var(--color-text-light)]"
                icon={<SendOutlined />}
              >
                发送
              </Button>
            </motion.div>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default MessageInputBox;
