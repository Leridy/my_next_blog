// 提取同步逻辑到自定义hook
import { useCallback, useEffect } from 'react';
import { ChatDatabase } from '@/IndexedDB/HelloBoss/ChatDatabase';
import { HelloBossState } from '@/IndexedDB/HelloBoss/types';

const useDebouncedStateSync = (db: ChatDatabase | null, state: HelloBossState) => {
  const syncConversations = useCallback(async () => {
    if (!db || !state.conversations) return;

    const dbConversations = await db.getAllConversations();
    const dbConversationIds = new Set(dbConversations.map((c) => c.id));

    const newConversations = state.conversations.filter((c) => !dbConversationIds.has(c.id));
    const modifiedConversations = state.conversations.filter((c) => {
      const dbConv = dbConversations.find((dbC) => dbC.id === c.id);
      return dbConv && JSON.stringify(dbConv) !== JSON.stringify(c);
    });

    await Promise.all([...newConversations.map((c) => db.addConversation(c)), ...modifiedConversations.map((c) => db.updateConversation(c.id, c))]);
  }, [db, state.conversations]);

  const syncConfigurations = useCallback(async () => {
    if (!db || !state.configurations) return;

    const dbConfigs = await db.getAllConfigurations();
    const dbConfigIds = new Set(dbConfigs.map((c) => c.id));

    const newConfigs = state.configurations.filter((c) => !dbConfigIds.has(c.id));
    const modifiedConfigs = state.configurations.filter((c) => {
      const dbConfig = dbConfigs.find((dbC) => dbC.id === c.id);
      return dbConfig && JSON.stringify(dbConfig) !== JSON.stringify(c);
    });

    await Promise.all([...newConfigs.map((c) => db.addConfiguration(c)), ...modifiedConfigs.map((c) => db.updateConfiguration(c.id, c))]);
  }, [db, state.configurations]);

  const syncPreferences = useCallback(async () => {
    if (!db || !state.preferences) return;

    await Promise.all(
      Object.entries(state.preferences).map(async ([key, pref]) => {
        const dbPref = await db.getPreference(pref.userId, key);
        if (!dbPref || JSON.stringify(dbPref) !== JSON.stringify(pref)) {
          await db.setPreference(pref);
        }
      })
    );
  }, [db, state.preferences]);

  const syncMessages = useCallback(async () => {
    if (!db || !state.currentConversation || !state.messages) return;

    const dbMessages = await db.getMessagesByConversation(state.currentConversation.id);
    const dbMessageIds = new Set(dbMessages.map((m) => m.id));

    const newMessages = state.messages.filter((m) => !dbMessageIds.has(m.id) && m.conversationId === state.currentConversation?.id);
    const modifiedMessages = state.messages.filter((m) => {
      const dbMsg = dbMessages.find((dbM) => dbM.id === m.id);
      return dbMsg && JSON.stringify(dbMsg) !== JSON.stringify(m);
    });

    await Promise.all([...newMessages.map((m) => db.addMessage(m)), ...modifiedMessages.map((m) => db.updateMessage(m.id, m))]);
  }, [db, state.currentConversation, state.messages]);

  // 使用更智能的防抖策略
  useEffect(() => {
    if (!db) return;

    const debounceDelay = 500;
    const timer = setTimeout(async () => {
      try {
        await Promise.all([syncConversations(), syncConfigurations(), syncPreferences(), syncMessages()]);
      } catch (error) {
        console.error('State sync failed:', error);
        // 可以添加重试逻辑或错误上报
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [db, syncConversations, syncConfigurations, syncPreferences, syncMessages]);
};

export default useDebouncedStateSync;
