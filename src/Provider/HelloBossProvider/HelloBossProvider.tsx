// AppContext.tsx
import React, { createContext, useReducer, useEffect, useMemo, Dispatch, ReactNode, FC, useState, useContext } from 'react';
import { appReducer, initialState } from './appReducer';
import { HelloBossState, AppAction, Conversation, Configuration, ConfigurationType, Message, Preference } from '@/IndexedDB/HelloBoss/types';
import { ChatDatabase } from '@/IndexedDB/HelloBoss/ChatDatabase';
import useStreamApi, { parseSSEData } from '@/app/manage/hooks/useStreamApi';

export interface HelloBossContextType extends HelloBossState {
  loading: boolean;
  isStreaming: boolean;
  dispatch: Dispatch<AppAction>;
  initializeDB: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  createConversation: (title: string) => Promise<string>;
  getConversation: (id: string) => Promise<Conversation | null>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  pinConversation: (id: string, isPinned: boolean) => Promise<void>;
  archiveConversation: (id: string, isArchived: boolean) => Promise<void>;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  getMessage: (id: string) => Promise<Message | null>;
  getMessagesByConversation: (conversationId: string) => Promise<Message[]>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  addConfiguration: (config: Omit<Configuration, 'id'>) => Promise<string>;
  getConfiguration: (id: string) => Promise<Configuration | null>;
  updateConfiguration: (id: string, updates: Partial<Configuration>) => Promise<void>;
  deleteConfiguration: (id: string) => Promise<void>;
  getConfigurationsByType: (type: ConfigurationType) => Promise<Configuration[]>;
  getAllConfigurations: () => Promise<Configuration[]>;
  setPreference: (pref: Omit<Preference, 'updatedAt'>) => Promise<void>;
  getPreference: (userId: string, key: string) => Promise<Preference | null>;
  deletePreference: (userId: string, key: string) => Promise<void>;
  abortStream: () => void;
}

const HelloBossContext = createContext<HelloBossContextType | undefined>(undefined);

export const HelloBossProvider: FC<{ children: ReactNode; userId: string | null }> = ({ children, userId }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, setLoading] = useState(true);

  const { streamFetch, abortStream, isStreaming } = useStreamApi<{
    configurations: Configuration[];
    messages: Message[];
  }>({
    apiURL: 'https://ai.huashui.cc/api/ai/hello-boss',
    onChunk: (chunk) => {
      console.log(chunk);
      const parsedData = parseSSEData(chunk);
      if (parsedData.length > 0) {
        parsedData.forEach((response) => {
          if (typeof response === 'object' && response !== null) {
            const content = response.choices[0]?.delta.content || '';
            dispatch({
              type: 'UPDATE_MESSAGE_CONTENT',
              payload: {
                id: 'last-assistant',
                content: (prevContent: string) => prevContent + content,
              },
            });
          }
        });
      }
    },
    onComplete: async () => {
      if (!db || !state.currentConversation) return;
      const messages = await db.getMessagesByConversation(state.currentConversation.id);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        await db.updateMessage(lastMessage.id, { status: 'sent' });
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: lastMessage.id,
            updates: { status: 'sent' },
          },
        });
      }
    },
    onError: (error) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: 'last-assistant',
          updates: {
            status: 'failed',
            content: `Error: ${error.message}`,
          },
        },
      });
    },
  });

  const db = useMemo(() => {
    return userId ? new ChatDatabase(userId) : null;
  }, [userId]);

  const initializeDB = async () => {
    if (!db) return;
    try {
      setLoading(true);
      dispatch({ type: 'INITIALIZE_START' });
      await db.initialize();
      dispatch({ type: 'INITIALIZE_SUCCESS', payload: {} });
    } catch (error) {
      dispatch({ type: 'INITIALIZE_FAILURE', error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    if (!db) return;
    try {
      setLoading(true);
      dispatch({ type: 'INITIALIZE_START' });
      const [conversations, configurations, preferences] = await Promise.all([db.getAllConversations(), db.getConfigurationsByType('resume'), db.getPreference('currentUser', 'theme')]);
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { conversations, configurations, preferences },
      });
    } catch (error) {
      dispatch({ type: 'INITIALIZE_FAILURE', error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

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

  const sendMessage = async (content: string) => {
    if (!db || !state.currentConversation) return;

    // Add user message
    const userMessage = {
      conversationId: state.currentConversation.id,
      createdAt: Date.now(),
      role: 'user' as const,
      content,
      status: 'sent' as const,
    };
    const userMessageId = await db.addMessage(userMessage);
    dispatch({ type: 'ADD_MESSAGE', payload: { ...userMessage, id: userMessageId } });

    // Add AI message
    const aiMessage = {
      conversationId: state.currentConversation.id,
      id: 'last-assistant',
      createdAt: Date.now(),
      role: 'assistant' as const,
      content: '',
      status: 'pending' as const,
    };

    try {
      await db.addMessage(aiMessage);
      console.log('AI message added:', aiMessage);
      dispatch({ type: 'ADD_MESSAGE', payload: { ...aiMessage, id: aiMessage.id } });
    } catch (error) {
      console.error('Error adding AI message:', error);
    }

    try {
      const configurations = await db.getAllConfigurations();
      const messages = await db.getMessagesByConversation(state.currentConversation.id);

      await streamFetch({
        configurations,
        messages,
      });

      // Update conversation metadata
      await db.updateConversation(state.currentConversation.id, {
        lastMessage: content,
        updatedAt: Date.now(),
        messageCount: messages.length + 1,
      });
      dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: {
          id: state.currentConversation.id,
          updates: {
            lastMessage: content,
            updatedAt: Date.now(),
            messageCount: messages.length + 1,
          },
        },
      });
    } catch (error) {
      await db.updateMessage(aiMessage.id, { status: 'failed' });
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: aiMessage.id, updates: { status: 'failed' } },
      });
      console.error('Error sending message:', error);
    }
  };

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

  useEffect(() => {
    const syncState = async () => {
      if (!db) return;

      try {
        if (state.conversations) {
          const dbConversations = await db.getAllConversations();
          const dbConversationIds = new Set(dbConversations.map((c) => c.id));

          const newConversations = state.conversations.filter((c) => !dbConversationIds.has(c.id));
          await Promise.all(newConversations.map((c) => db.addConversation(c)));

          const modifiedConversations = state.conversations.filter((c) => {
            const dbConv = dbConversations.find((dbC) => dbC.id === c.id);
            return dbConv && JSON.stringify(dbConv) !== JSON.stringify(c);
          });
          await Promise.all(modifiedConversations.map((c) => db.updateConversation(c.id, c)));
        }

        if (state.configurations) {
          const dbConfigs = await db.getAllConfigurations();
          const dbConfigIds = new Set(dbConfigs.map((c) => c.id));

          const newConfigs = state.configurations.filter((c) => !dbConfigIds.has(c.id));
          await Promise.all(newConfigs.map((c) => db.addConfiguration(c)));

          const modifiedConfigs = state.configurations.filter((c) => {
            const dbConfig = dbConfigs.find((dbC) => dbC.id === c.id);
            return dbConfig && JSON.stringify(dbConfig) !== JSON.stringify(c);
          });
          await Promise.all(modifiedConfigs.map((c) => db.updateConfiguration(c.id, c)));
        }

        if (state.preferences) {
          for (const [key, pref] of Object.entries(state.preferences)) {
            const dbPref = await db.getPreference(pref.userId, key);
            if (!dbPref || JSON.stringify(dbPref) !== JSON.stringify(pref)) {
              await db.setPreference(pref);
            }
          }
        }

        if (state.currentConversation) {
          const dbMessages = await db.getMessagesByConversation(state.currentConversation.id);
          const dbMessageIds = new Set(dbMessages.map((m) => m.id));

          const newMessages = state.messages.filter((m) => !dbMessageIds.has(m.id) && m.conversationId === state.currentConversation?.id);
          await Promise.all(newMessages.map((m) => db.addMessage(m)));

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

    const debounceTimer = setTimeout(() => {
      syncState();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [state, db]);

  const value = useMemo(
    () => ({
      ...state,
      loading,
      isStreaming,
      dispatch,
      initializeDB,
      loadInitialData,
      createConversation,
      selectConversation: async (id: string) => {
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: state.conversations.find((conv) => conv.id === id) || null });
        const messages = db ? await db.getMessagesByConversation(id) : [];
        dispatch({ type: 'SET_MESSAGES', payload: messages });
      },
      getConversation: async (id: string) => (db ? await db.getConversation(id) : null),
      updateConversation,
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
        const conversation = state.conversations.find((conv) => conv.id === state.currentConversation?.id);
        if (conversation) {
          const updatedConversation = {
            ...conversation,
            lastMessage: updates.content || conversation.lastMessage,
            updatedAt: Date.now(),
          };
          await db.updateConversation(conversation.id, updatedConversation);
          dispatch({
            type: 'UPDATE_CONVERSATION',
            payload: {
              id: conversation.id,
              updates: updatedConversation,
            },
          });
        }
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
      getAllConfigurations: async () => (db ? await db.getAllConfigurations() : []),
      deletePreference: async (userId: string, key: string) => {
        if (!db) return;
        await db.deletePreference(userId, key);
        dispatch({ type: 'SET_PREFERENCE', payload: null });
      },
      abortStream,
    }),
    [state, db, loading, isStreaming, abortStream]
  );

  async function initializeAndLoadData() {
    await initializeDB();
    await loadInitialData();
  }

  useEffect(() => {
    if (userId) {
      initializeAndLoadData();
    }
  }, [userId]);

  return <HelloBossContext.Provider value={value}>{children}</HelloBossContext.Provider>;
};

export const useHelloBossContext = () => {
  const context = useContext(HelloBossContext);
  if (!context) {
    throw new Error('useHelloBossContext must be used within a HelloBossProvider');
  }
  return context;
};
