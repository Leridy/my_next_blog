import React, { useState, useMemo, useCallback } from 'react';
import { Input } from 'antd';
import { motion } from 'framer-motion';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ChevronRight, Plus } from 'lucide-react';
import { Conversation } from '@/IndexedDB/HelloBoss/types';
import ConversationItem from '@/Components/ChatComponents/Conversition/ConversationItem';
import LoadingPanel from '@/Components/MainBoard/HotBoard/LoadingPanel';

interface ConversationListProps {
  conversations: Conversation[];
  currentId?: string;
  onSelect: (id: string) => void;
  onPin?: (id: string, isPin: boolean) => void;
  onArchive?: (id: string, isArchive: boolean) => void;
  onNewConversation?: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

interface GroupedConversations {
  date: string;
  label: string;
  conversations: Conversation[];
}

const ITEM_HEIGHT = 90;
const GROUP_HEADER_HEIGHT = 40;

// 分组标题组件
const GroupHeader: React.FC<{
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ label, isExpanded, onToggle }) => {
  return (
    <motion.div
      className="flex items-center px-4 py-2 bg-quaternary text-text cursor-pointer"
      onClick={onToggle}
      whileHover={{ backgroundColor: 'var(--color-secondary)' }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight size={16} />
      </motion.div>
      <span className="ml-2 font-medium">{label}</span>
    </motion.div>
  );
};

const ConversationList: React.FC<ConversationListProps> = (props) => {
  const { conversations, currentId, onSelect, onPin, onArchive, onNewConversation, onDelete, loading = false } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 分组会话逻辑
  const groupedConversations = useMemo<GroupedConversations[]>(() => {
    const filtered = conversations.filter(
      (conv) => conv.title.toLowerCase().includes(searchQuery.toLowerCase()) || conv.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) || conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, Conversation[]> = {};

    filtered.forEach((conv) => {
      const date = new Date(conv.updatedAt);
      let dateKey: string;

      if (isToday(date)) {
        dateKey = 'today';
      } else if (isYesterday(date)) {
        dateKey = 'yesterday';
      } else {
        dateKey = format(date, 'yyyy-MM-dd');
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(conv);
    });

    // 排序并转换为数组
    return Object.entries(groups)
      .sort(([aKey], [bKey]) => {
        // 置顶会话优先
        if (aKey === 'pinned') return -1;
        if (bKey === 'pinned') return 1;

        // 按日期排序
        if (aKey === 'today') return -1;
        if (bKey === 'today') return 1;
        if (aKey === 'yesterday') return -1;
        if (bKey === 'yesterday') return 1;

        return bKey.localeCompare(aKey);
      })
      .map(([date, convs]) => {
        let label = '';
        if (date === 'today') label = '今天';
        else if (date === 'yesterday') label = '昨天';
        else label = format(parseISO(date), 'MMMM d, yyyy');

        return {
          date,
          label,
          conversations: convs.sort((a, b) => {
            // 置顶会话排在最前面
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            // 按更新时间排序
            return b.updatedAt - a.updatedAt;
          }),
        };
      });
  }, [conversations, searchQuery]);

  // 计算虚拟列表的总项数和每项内容
  const itemCount = useMemo(() => {
    return groupedConversations.reduce((total, group) => {
      return total + 1 + (expandedGroups[group.date] ? group.conversations.length : 0);
    }, 0);
  }, [groupedConversations, expandedGroups]);

  // 虚拟列表项渲染
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      let currentIndex = 0;

      for (const group of groupedConversations) {
        if (index === currentIndex) {
          // 渲染分组标题
          return (
            <div style={style}>
              <GroupHeader
                label={group.label}
                isExpanded={expandedGroups[group.date] ?? true}
                onToggle={() =>
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [group.date]: !(prev[group.date] ?? true),
                  }))
                }
              />
            </div>
          );
        }
        currentIndex++;

        if (expandedGroups[group.date] ?? true) {
          if (index < currentIndex + group.conversations.length) {
            const conv = group.conversations[index - currentIndex];
            // 渲染会话项
            return (
              <div style={style}>
                <ConversationItem
                  conversation={conv}
                  isActive={conv.id === currentId}
                  onSelect={onSelect}
                  onPin={onPin}
                  onArchive={onArchive}
                  onDelete={onDelete}
                />
              </div>
            );
          }
          currentIndex += group.conversations.length;
        }
      }

      return null;
    },
    [groupedConversations, expandedGroups, currentId, onSelect]
  );

  // 获取虚拟列表项高度
  const getItemSize = useCallback(
    (index: number): number => {
      let currentIndex = 0;

      for (const group of groupedConversations) {
        if (index === currentIndex) {
          return GROUP_HEADER_HEIGHT;
        }
        currentIndex++;

        if (expandedGroups[group.date] ?? true) {
          if (index < currentIndex + group.conversations.length) {
            return ITEM_HEIGHT;
          }
          currentIndex += group.conversations.length;
        }
      }

      return ITEM_HEIGHT;
    },
    [groupedConversations, expandedGroups]
  );

  return (
    <div className="flex flex-col h-full select-none">
      {/* 新增的新会话按钮区域 */}
      {loading ? (
        <LoadingPanel />
      ) : (
        <>
          <div className="p-4 border-b border-border">
            <Input.Search
              placeholder="搜索会话"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>
          <div className="p-3 border-b border-border flex justify-between items-center bg-tertiary">
            <motion.button
              onClick={onNewConversation}
              className="px-4 py-2 rounded-md flex items-center w-full"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text)',
              }}
              whileHover={{
                backgroundColor: 'var(--color-secondary)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              whileTap={{
                backgroundColor: 'var(--color-tertiary)',
                scale: 0.98,
              }}
              transition={{ duration: 0.2 }}
            >
              <Plus
                className="mr-2"
                size={16}
              />
              新会话
            </motion.button>
          </div>
          <div className="flex-1 overflow-hidden select-none">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={itemCount}
                  itemSize={(index) => getItemSize(index)}
                  itemData={groupedConversations}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationList;
