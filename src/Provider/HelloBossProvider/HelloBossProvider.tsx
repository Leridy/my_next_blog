// AppContext.tsx
import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import { appReducer, initialState } from './appReducer';
import { HelloBossState, AppAction, Conversation, Configuration, ConfigurationType, Message, Preference } from '@/IndexedDB/HelloBoss/types';
import { ChatDatabase } from '@/IndexedDB/HelloBoss/ChatDatabase';

// 更新AppContextType接口
interface HelloBossContextType extends HelloBossState {
  dispatch: React.Dispatch<AppAction>;
  // 初始化方法
  initializeDB: () => Promise<void>;
  loadInitialData: () => Promise<void>;

  // Conversation 方法
  createConversation: (title: string) => Promise<string>;
  getConversation: (id: string) => Promise<Conversation | null>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  pinConversation: (id: string, isPinned: boolean) => Promise<void>;
  archiveConversation: (id: string, isArchived: boolean) => Promise<void>;
  selectConversation: (id: string) => void;

  // Message 方法
  sendMessage: (content: string) => Promise<void>;
  getMessage: (id: string) => Promise<Message | null>;
  getMessagesByConversation: (conversationId: string) => Promise<Message[]>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Configuration 方法
  addConfiguration: (config: Omit<Configuration, 'id'>) => Promise<string>;
  getConfiguration: (id: string) => Promise<Configuration | null>;
  updateConfiguration: (id: string, updates: Partial<Configuration>) => Promise<void>;
  deleteConfiguration: (id: string) => Promise<void>;
  getConfigurationsByType: (type: ConfigurationType) => Promise<Configuration[]>;

  // Preference 方法
  setPreference: (pref: Omit<Preference, 'updatedAt'>) => Promise<void>;
  getPreference: (userId: string, key: string) => Promise<Preference | null>;
  deletePreference: (userId: string, key: string) => Promise<void>;
}

const HelloBossContext = createContext<HelloBossContextType | undefined>(undefined);

export const HelloBossProvider: React.FC<{ children: React.ReactNode; userId: string | null }> = ({ children, userId }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const db = useMemo(() => {
    return userId ? new ChatDatabase(userId) : null;
  }, [userId]);

  // 初始化数据库连接

  const initializeDB = async () => {
    if (!db) return;
    try {
      dispatch({ type: 'INITIALIZE_START' });
      await db.initialize();
      dispatch({ type: 'INITIALIZE_SUCCESS', payload: {} });
    } catch (error) {
      dispatch({ type: 'INITIALIZE_FAILURE', error: (error as Error).message });
    }
  };

  // 加载初始数据
  const loadInitialData = async () => {
    if (!db) return;
    try {
      dispatch({ type: 'INITIALIZE_START' });
      const [conversations, configurations, preferences] = await Promise.all([db.getAllConversations(), db.getConfigurationsByType('resume'), db.getPreference('currentUser', 'theme')]);
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { conversations, configurations, preferences },
      });
    } catch (error) {
      dispatch({ type: 'INITIALIZE_FAILURE', error: (error as Error).message });
    }
  };

  // 创建新会话
  const createConversation = async (title: string) => {
    if (!db) throw new Error('Database not initialized');
    const newConversation = {
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isArchived: false,
      configId: null,
      lastMessage: '',
      messageCount: 0,
      tags: [],
      modelUsed: 'gpt-4',
    };
    const id = await db.addConversation(newConversation);
    const createdConversation = { ...newConversation, id };
    dispatch({ type: 'ADD_CONVERSATION', payload: createdConversation });
    return id;
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!db) throw new Error('Database not initialized');
    if (!state.currentConversation) return;

    const newMessage = {
      conversationId: state.currentConversation.id,
      createdAt: Date.now(),
      role: 'user' as const,
      content,
      status: 'pending' as const,
    };
    const id = await db.addMessage(newMessage);
    const createdMessage = { ...newMessage, id };
    dispatch({ type: 'ADD_MESSAGE', payload: createdMessage });

    // 模拟AI响应
    setTimeout(async () => {
      const aiMessage = {
        conversationId: state.currentConversation!.id,
        createdAt: Date.now(),
        role: 'assistant' as const,
        content: 'This is a simulated AI response',
        status: 'sent' as const,
      };
      const aiId = await db.addMessage(aiMessage);
      dispatch({ type: 'ADD_MESSAGE', payload: { ...aiMessage, id: aiId } });
    }, 1000);
  };

  // 自动同步状态到IndexedDB
  useEffect(() => {
    const syncState = async () => {
      if (!db) return;

      try {
        // Sync conversations
        if (state.conversations) {
          const dbConversations = await db.getAllConversations();
          const dbConversationIds = new Set(dbConversations.map((c) => c.id));

          // Add new conversations to DB
          const newConversations = state.conversations.filter((c) => !dbConversationIds.has(c.id));
          await Promise.all(newConversations.map((c) => db.addConversation(c)));

          // Update modified conversations
          const modifiedConversations = state.conversations.filter((c) => {
            const dbConv = dbConversations.find((dbC) => dbC.id === c.id);
            return dbConv && JSON.stringify(dbConv) !== JSON.stringify(c);
          });
          await Promise.all(modifiedConversations.map((c) => db.updateConversation(c.id, c)));
        }

        // Sync configurations
        if (state.configurations) {
          const dbConfigs = await db.getAllConfigurations();
          const dbConfigIds = new Set(dbConfigs.map((c) => c.id));

          // Add new configs
          const newConfigs = state.configurations.filter((c) => !dbConfigIds.has(c.id));
          await Promise.all(newConfigs.map((c) => db.addConfiguration(c)));

          // Update modified configs
          const modifiedConfigs = state.configurations.filter((c) => {
            const dbConfig = dbConfigs.find((dbC) => dbC.id === c.id);
            return dbConfig && JSON.stringify(dbConfig) !== JSON.stringify(c);
          });
          await Promise.all(modifiedConfigs.map((c) => db.updateConfiguration(c.id, c)));
        }

        // Sync preferences
        if (state.preferences) {
          for (const [key, pref] of Object.entries(state.preferences)) {
            const dbPref = await db.getPreference(pref.userId, key);
            if (!dbPref || JSON.stringify(dbPref) !== JSON.stringify(pref)) {
              await db.setPreference(pref);
            }
          }
        }

        // Sync current conversation messages
        if (state.currentConversation) {
          const dbMessages = await db.getMessagesByConversation(state.currentConversation.id);
          const dbMessageIds = new Set(dbMessages.map((m) => m.id));

          // Add new messages
          const newMessages = state.messages.filter((m) => !dbMessageIds.has(m.id) && m.conversationId === state.currentConversation?.id);
          await Promise.all(newMessages.map((m) => db.addMessage(m)));

          // Update modified messages
          const modifiedMessages = state.messages.filter((m) => {
            const dbMsg = dbMessages.find((dbM) => dbM.id === m.id);
            return dbMsg && JSON.stringify(dbMsg) !== JSON.stringify(m);
          });
          await Promise.all(modifiedMessages.map((m) => db.updateMessage(m.id, m)));
        }
      } catch (error) {
        console.error('State sync failed:', error);
      }
    };

    // Debounce sync to avoid too frequent updates
    const debounceTimer = setTimeout(() => {
      syncState();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [state, db]);

  const pinConversation = async (id: string, isPinned: boolean) => {
    await updateConversation(id, { isPinned });
  };

  const archiveConversation = async (id: string, isArchived: boolean) => {
    await updateConversation(id, { isArchived });
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    if (!db) throw new Error('Database not initialized');
    await db.updateConversation(id, updates);
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
  };

  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      initializeDB,
      loadInitialData,
      createConversation,

      selectConversation: (id: string) => {
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: state.conversations.find((conv) => conv.id === id) || null });
      },
      getConversation: async (id: string) => (db ? await db.getConversation(id) : null),
      updateConversation: async (id: string, updates: Partial<Conversation>) => {
        if (!db) return;
        await db.updateConversation(id, updates);
        dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
      },
      deleteConversation: async (id: string) => {
        if (!db) return;
        await db.deleteConversation(id);
        dispatch({ type: 'DELETE_CONVERSATION', payload: id });
      },
      pinConversation,
      archiveConversation,
      sendMessage,
      getMessage: async (id: string) => (db ? await db.getMessage(id) : null),
      getMessagesByConversation: async (conversationId: string) => (db ? await db.getMessagesByConversation(conversationId) : []),
      updateMessage: async (id: string, updates: Partial<Message>) => {
        if (!db) return;
        await db.updateMessage(id, updates);
        dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
      },
      deleteMessage: async (id: string) => {
        if (!db) return;
        await db.deleteMessage(id);
        dispatch({ type: 'DELETE_MESSAGE', payload: id });
      },
      addConfiguration: async (config: Omit<Configuration, 'id'>) => {
        if (!db) throw new Error('Database not initialized');
        const id = await db.addConfiguration(config);
        const newConfig = { ...config, id, createdAt: Date.now(), updatedAt: Date.now() };
        dispatch({ type: 'ADD_CONFIGURATION', payload: newConfig });
        return id;
      },
      getConfiguration: async (id: string) => (db ? await db.getConfiguration(id) : null),
      updateConfiguration: async (id: string, updates: Partial<Configuration>) => {
        if (!db) return;
        await db.updateConfiguration(id, updates);
        dispatch({ type: 'UPDATE_CONFIGURATION', payload: { id, updates } });
      },
      deleteConfiguration: async (id: string) => {
        if (!db) return;
        await db.deleteConfiguration(id);
        dispatch({ type: 'DELETE_CONFIGURATION', payload: id });
      },
      getConfigurationsByType: async (type: ConfigurationType) => (db ? await db.getConfigurationsByType(type) : []),
      setPreference: async (pref: Omit<Preference, 'updatedAt'>) => {
        if (!db) return;
        await db.setPreference(pref);
        const updatedPref = { ...pref, updatedAt: Date.now() };
        dispatch({ type: 'SET_PREFERENCE', payload: updatedPref });
      },
      getPreference: async (userId: string, key: string) => (db ? await db.getPreference(userId, key) : null),
      deletePreference: async (userId: string, key: string) => {
        if (!db) return;
        await db.deletePreference(userId, key);
        dispatch({ type: 'SET_PREFERENCE', payload: null });
      },
    }),
    [state, db]
  );

  // 初始化并加载数据
  async function initializeAndLoadData() {
    await initializeDB();
    await loadInitialData();
  }

  // 加载完成后初始化 db
  useEffect(() => {
    if (userId) {
      initializeAndLoadData();
    }
  }, [userId]);

  // watching change of state
  useEffect(() => {
    console.log('State changed:', state);
  }, [state]);

  // 在Provider value中暴露所有方法
  return <HelloBossContext.Provider value={value}>{children}</HelloBossContext.Provider>;
};

// implementation of useHelloBossContext
export const useHelloBossContext = () => {
  const context = React.useContext(HelloBossContext);
  if (!context) {
    throw new Error('useHelloBossContext must be used within a HelloBossProvider');
  }
  return context;
};
