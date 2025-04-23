import { Conversation } from '@/IndexedDB/HelloBoss/types';
import React, { useState, MouseEvent } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
// use antd icon to replace icon
import { PushpinOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

// 会话项组件
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
    return format(new Date(timestamp), 'h:mm a');
  };

  const handlePin = (e: MouseEvent) => {
    e.stopPropagation();
    // TODO: 实现置顶逻辑
    onPin?.(conversation.id, !conversation.isPinned);
  };

  const handleArchive = (e: MouseEvent) => {
    e.stopPropagation();
    // TODO: 实现归档逻辑
    onArchive?.(conversation.id, !conversation.isArchived);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    // use antd modal to confirm delete
    Modal.confirm({
      title: `删除会话 “${conversation.title}”`,
      content: '确定要删除此会话吗？此操作不可逆。',
      onOk: () => {
        onDelete?.(conversation.id);
      },
    });
  };

  return (
    <motion.div
      className={`flex items-center px-4 py-3 border-b border-border cursor-pointer ${isActive ? 'bg-primary' : 'hover:bg-quaternary'} min-h-[90px]`}
      onClick={() => onSelect(conversation.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={false}
      animate={{ backgroundColor: isActive ? 'var(--color-primary)' : 'transparent' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium truncate">{conversation.title}</h3>
          <span className="text-xs text-text-secondary ml-2">{formatTime(conversation.updatedAt)}</span>
        </div>
        <p className="text-xs text-text-secondary truncate mt-1">{conversation.lastMessage}</p>
        {conversation.tags.length > 0 && (
          <div className="flex mt-1 space-x-1">
            {conversation.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 bg-secondary rounded"
              >
                {tag}
              </span>
            ))}
            {conversation.tags.length > 2 && <span className="text-xs px-1.5 py-0.5 bg-secondary rounded">+{conversation.tags.length - 2}</span>}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            className="flex space-x-2 ml-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handlePin}
              className={`p-1 rounded-sm hover:bg-black/5 cursor-pointer flex items-center justify-center ${conversation.isPinned ? 'text-yellow-500' : 'text-[var(--color-secondary)]'}`}
            >
              <PushpinOutlined size={16} />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={handleArchive}
              className="p-1 rounded-sm hover:bg-black/5 cursor-pointer flex items-center justify-center text-[var(--color-secondary)]"
            >
              <InboxOutlined size={16} />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={handleDelete}
              className="p-1 rounded-sm hover:bg-black/5 cursor-pointer flex items-center justify-center text-[var(--color-secondary)]"
            >
              <DeleteOutlined />
            </div>
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
