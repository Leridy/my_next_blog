// ConversationItem.tsx
import { Conversation } from '@/IndexedDB/AIChat/types';
import React, { useState, MouseEvent } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { PushpinOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

const ConversationItem: React.FC<{
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onPin?: (id: string, isPin: boolean) => void;
  onArchive?: (id: string, isArchive: boolean) => void;
  onDelete?: (id: string) => void;
}> = (props) => {
  const { conversation, isActive, onSelect, onPin, onArchive, onDelete } = props;
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const handlePin = (e: MouseEvent) => {
    e.stopPropagation();
    onPin?.(conversation.id, !conversation.isPinned);
  };

  const handleArchive = (e: MouseEvent) => {
    e.stopPropagation();
    onArchive?.(conversation.id, !conversation.isArchived);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: `删除会话 "${conversation.title}"`,
      content: '确定要删除此会话吗？此操作不可逆。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => onDelete?.(conversation.id),
    });
  };

  return (
    <motion.div
      className={`flex items-center px-4 py-3 border-b border-border/50 cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/30' : 'hover:bg-[var(--color-quaternary)]/30'} min-h-[84px] transition-colors duration-150`}
      onClick={() => onSelect(conversation.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={false}
      animate={{
        backgroundColor: isActive ? 'var(--color-primary)' : isHovered ? 'var(--color-quaternary)' : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium truncate flex items-center">
            {conversation.isPinned && (
              <PushpinOutlined
                className="mr-1 text-yellow-500"
                style={{ fontSize: 12 }}
              />
            )}
            {conversation.title}
          </h3>
          <span className="text-xs text-text-secondary ml-2 whitespace-nowrap">{formatTime(conversation.updatedAt)}</span>
        </div>
        <p className="text-xs text-text-secondary truncate mt-1">{conversation.lastMessage}</p>
        {conversation.tags.length > 0 && (
          <div className="flex mt-1 gap-1 flex-wrap">
            {conversation.tags.slice(0, 2).map((tag) => (
              <motion.span
                key={tag}
                className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
              >
                {tag}
              </motion.span>
            ))}
            {conversation.tags.length > 2 && <span className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full">+{conversation.tags.length - 2}</span>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            className="flex gap-2 ml-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              role="button"
              tabIndex={0}
              onClick={handlePin}
              className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <PushpinOutlined className={conversation.isPinned ? 'text-yellow-500' : 'text-text-secondary'} />
            </motion.div>
            <motion.div
              role="button"
              tabIndex={0}
              onClick={handleArchive}
              className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <InboxOutlined className="text-text-secondary" />
            </motion.div>
            <motion.div
              role="button"
              tabIndex={0}
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-black/10 cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <DeleteOutlined className="text-text-secondary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {conversation.messageCount > 0 && (
        <motion.div
          className="ml-2 w-5 h-5 rounded-full bg-success flex items-center justify-center text-white text-xs"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {conversation.messageCount > 9 ? '9+' : conversation.messageCount}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConversationItem;
