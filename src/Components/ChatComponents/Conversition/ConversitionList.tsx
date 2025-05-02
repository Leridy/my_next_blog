// ConversationList.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Input, Button } from 'antd';
import { motion } from 'framer-motion';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ChevronDown, Plus } from 'lucide-react';
import { Conversation } from '@/IndexedDB/AIChat/types';
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

const ITEM_HEIGHT = 84;
const GROUP_HEADER_HEIGHT = 48;

const GroupHeader: React.FC<{
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
}> = ({ label, isExpanded, onToggle, count }) => {
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3 bg-quaternary/50 text-text cursor-pointer"
      onClick={onToggle}
      whileHover={{ backgroundColor: 'var(--color-quaternary)' }}
      transition={{ duration: 0.15 }}
      initial={false}
    >
      <div className="flex items-center">
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={16} />
        </motion.div>
        <span className="ml-2 font-medium text-sm">{label}</span>
      </div>
      <span className="text-xs text-text-secondary">{count}条对话</span>
    </motion.div>
  );
};

const ConversationList: React.FC<ConversationListProps> = (props) => {
  const { conversations, currentId, onSelect, onPin, onArchive, onNewConversation, onDelete, loading = false } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 初始化时默认展开所有分组
  useEffect(() => {
    if (conversations.length > 0 && Object.keys(expandedGroups).length === 0) {
      const initialExpandedState = groupedConversations.reduce(
        (acc, group) => {
          acc[group.date] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setExpandedGroups(initialExpandedState);
    }
  }, [conversations]);

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

    return Object.entries(groups)
      .sort(([aKey], [bKey]) => {
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
        else label = format(parseISO(date), 'yyyy年M月d日');

        return {
          date,
          label,
          conversations: convs.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.updatedAt - a.updatedAt;
          }),
        };
      });
  }, [conversations, searchQuery]);

  const itemCount = useMemo(() => {
    return groupedConversations.reduce((total, group) => {
      return total + 1 + (expandedGroups[group.date] ? group.conversations.length : 0);
    }, 0);
  }, [groupedConversations, expandedGroups]);

  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      let currentIndex = 0;

      for (const group of groupedConversations) {
        if (index === currentIndex) {
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
                count={group.conversations.length}
              />
            </div>
          );
        }
        currentIndex++;

        if (expandedGroups[group.date] ?? true) {
          if (index < currentIndex + group.conversations.length) {
            const conv = group.conversations[index - currentIndex];
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
    [groupedConversations, expandedGroups, currentId, onSelect, onPin, onArchive, onDelete]
  );

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
    <div className="flex flex-col h-full select-none bg-background">
      {loading ? (
        <LoadingPanel />
      ) : (
        <>
          <div className="p-4 border-b border-border">
            <Input.Search
              placeholder="搜索会话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="w-full rounded-lg"
              size="large"
            />
          </div>

          <motion.div
            className="p-3 border-b border-border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={onNewConversation}
              type="primary"
              className="w-full h-10"
              icon={
                <Plus
                  size={16}
                  className="mr-2"
                />
              }
            >
              新会话
            </Button>
          </motion.div>

          <div className="flex-1 overflow-hidden">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={itemCount}
                  itemSize={getItemSize}
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
