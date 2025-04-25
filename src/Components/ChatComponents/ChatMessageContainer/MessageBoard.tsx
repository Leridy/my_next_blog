// MessageBoard.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import { Conversation, Message, MessageStatus } from '@/IndexedDB/HelloBoss/types';
import { HelloBossContextType } from '@/Provider/HelloBossProvider/HelloBossProvider';

interface MessageBoardProps {
  currentConversationId?: Conversation['id'];
  messages?: Message[];
  status?: MessageStatus;
  updateMessage: HelloBossContextType['updateMessage'];
  deleteMessage: HelloBossContextType['deleteMessage'];
}

const MessageBoard = (props: MessageBoardProps) => {
  const { currentConversationId, messages = [], status, updateMessage, deleteMessage } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const orderedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [orderedMessages]);

  if (!currentConversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>请选择或创建对话</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 max-h-[calc(100vh-340px)] overflow-auto"
    >
      {orderedMessages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageBubble
            message={message}
            isPending={status === 'pending' && index === orderedMessages.length - 1}
            updateMessage={updateMessage}
            deleteMessage={deleteMessage}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default MessageBoard;
