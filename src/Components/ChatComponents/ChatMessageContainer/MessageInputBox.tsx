import React, { useState, useRef } from 'react';
import { Button, message as antdMessage } from 'antd';
import dynamic from 'next/dynamic';
import { Configuration, ConfigurationType, Conversation, MessageStatus } from '@/IndexedDB/HelloBoss/types';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export interface MessageInputBoxProps {
  currentConversationId?: Conversation['id'];
  configurations?: Configuration[];
  status?: MessageStatus;
  sendMessage: (message: string) => Promise<void>;
  requiredConfigTypes?: ConfigurationType[];
}

const MessageInputBox = (props: MessageInputBoxProps) => {
  const { currentConversationId, configurations = [], status, sendMessage, requiredConfigTypes = [] } = props;
  const [value, setValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<typeof MDEditor>(null);

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
          data-color-mode="light"
        />
        <div className="flex justify-between mt-3">
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            type="text"
            size="small"
          />
          <Button
            type="primary"
            onClick={handleSend}
            loading={status === 'pending'}
            disabled={!value.trim() || status === 'pending' || !currentConversationId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInputBox;
