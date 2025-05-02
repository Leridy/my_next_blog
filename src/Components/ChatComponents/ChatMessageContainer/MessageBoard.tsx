// MessageBoard.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentOutlined, SmileOutlined } from '@ant-design/icons';
import MessageBubble from './MessageBubble';
import { Conversation, Message, MessageStatus } from '@/IndexedDB/AIChat/types';
import { AIChatContextType } from '@/Provider/AIChatProvider/AIChatProvider';

interface MessageBoardProps {
  currentConversationId?: Conversation['id'];
  messages?: Message[];
  status?: MessageStatus;
  updateMessage: AIChatContextType['updateMessage'];
  deleteMessage: AIChatContextType['deleteMessage'];
}

const MessageBoard = (props: MessageBoardProps) => {
  const { currentConversationId, messages = [], status, updateMessage, deleteMessage } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const orderedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  // 平滑滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [orderedMessages]);

  if (!currentConversationId) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <CommentOutlined className="text-5xl mb-4" />
        <p className="text-lg">请选择或创建对话</p>
      </motion.div>
    );
  }

  if (orderedMessages.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <SmileOutlined className="text-5xl mb-4" />
        <p className="text-lg">发送第一条 JD 开始吧</p>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 max-h-[calc(100vh-340px)] overflow-auto px-4 py-2 space-y-3 scroll-smooth"
    >
      <AnimatePresence initial={false}>
        {orderedMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            layout
          >
            <MessageBubble
              message={message}
              isPending={status === 'pending' && index === orderedMessages.length - 1}
              updateMessage={updateMessage}
              deleteMessage={deleteMessage}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageBoard;
