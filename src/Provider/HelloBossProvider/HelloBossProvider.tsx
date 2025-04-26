// AppContext.tsx
import React, { createContext, useReducer, useEffect, useMemo, Dispatch, ReactNode, FC, useState, useContext } from 'react';
import { appReducer, initialState } from './appReducer';
import { HelloBossState, AppAction, Conversation, Configuration, ConfigurationType, Message, Preference, MessageRole, MessageStatus } from '@/IndexedDB/HelloBoss/types';
import { ChatDatabase } from '@/IndexedDB/HelloBoss/ChatDatabase';
import useStreamApi, { parseSSEData } from '@/app/manage/hooks/useStreamApi';
import useDebouncedStateSync from '@/Provider/HelloBossProvider/dbHook';

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

  const db = useMemo(() => {
    return userId ? new ChatDatabase(userId) : null;
  }, [userId]);

  useDebouncedStateSync(db, state);

  const initialConversationInfo = (content: string) => {
    const regex = /---conversationJSON-(.*?)---/g;
    const match = regex.exec(content);
    if (match && match[1]) {
      try {
        const conversationInfo = JSON.parse(match[1]);
        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: {
            id: state.currentConversation?.id || '',
            updates: {
              title: conversationInfo.description,
            },
          },
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  };

  const { streamFetch, abortStream, isStreaming } = useStreamApi<{
    configurations: Configuration[];
    messages: Message[];
  }>({
    apiURL: 'https://ai.huashui.cc/api/ai/hello-boss',
    onChunk: (chunk) => {
      const parsedData = parseSSEData(chunk);
      if (parsedData.length > 0) {
        parsedData
          .filter((response) => typeof response === 'object' && response !== null)
          .map((response) => {
            // new content
            const content = response.choices[0]?.delta.content;
            const messageId = response.id;

            if (content) {
              dispatch({
                type: 'UPDATE_STREAM_MESSAGE_CONTENT',
                payload: {
                  id: messageId,
                  status: 'pending',
                  conversationId: state.currentConversation?.id || '',
                  role: 'assistant' as MessageRole,
                  createdAt: Date.now(),
                  content,
                },
              });
            }
          });
      }
    },
    onComplete: async (fullResponse) => {
      if (!state.currentConversation) return;

      let messageData: Message = {
        id: crypto.randomUUID(),
        conversationId: state.currentConversation.id,
        createdAt: Date.now(),
        role: 'assistant' as MessageRole,
        content: '',
        status: 'sent' as MessageStatus,
      };
      const fullMessage = parseSSEData(fullResponse)
        .map((item) => {
          messageData = {
            id: item.id,
            conversationId: state.currentConversation?.id || '',
            createdAt: Date.now(),
            role: 'assistant' as MessageRole,
            content: '',
            status: 'sent' as MessageStatus,
          };

          return item.choices[0]?.delta.content;
        })
        .join('');

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          ...messageData,
          content: fullMessage,
        },
      });

      dispatch({
        type: 'RESET_STREAM_MESSAGE',
      });

      initialConversationInfo(fullMessage);
    },
    onError: (error) => {
      dispatch({
        type: 'UPDATE_STREAM_MESSAGE_CONTENT',
        payload: {
          status: 'failed',
          id: crypto.randomUUID(),
          content: `出现了错误：${(error as Error).message}`,
          conversationId: state.currentConversation?.id || '',
          role: 'assistant' as MessageRole,
          createdAt: Date.now(),
        },
      });
    },
  });

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
    await selectConversation(id);
    return id;
  };

  const sendMessage = async (content: string) => {
    if (!state.currentConversation) {
      const id = await createConversation('New Conversation');
      await selectConversation(id);
      if (!state.currentConversation) return;
    }

    const userMessageId = crypto.randomUUID();
    const userMessage = {
      id: userMessageId,
      conversationId: state.currentConversation!.id,
      createdAt: Date.now(),
      role: 'user' as MessageRole,
      content,
      status: 'sent' as MessageStatus,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: userMessage,
    });

    try {
      const configurations = (await db?.getAllConfigurations()) || [];
      const messages = (await db?.getMessagesByConversation(state.currentConversation.id)) || [];

      await streamFetch({
        configurations,
        messages: [...messages, userMessage],
      });

      const updates = {
        lastMessage: content,
        updatedAt: Date.now(),
        messageCount: messages.length + 1,
      };

      dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: {
          id: state.currentConversation.id,
          updates,
        },
      });
    } catch (error) {
      dispatch({
        type: 'UPDATE_STREAM_MESSAGE_CONTENT',
        payload: {
          status: 'failed',
          id: userMessageId,
          content: `出现了错误：${(error as Error).message}`,
          conversationId: state.currentConversation?.id || '',
          role: 'assistant' as MessageRole,
          createdAt: Date.now(),
        },
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
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
  };

  const selectConversation = async (id: string) => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: state.conversations.find((conv) => conv.id === id) || null });
    const messages = db ? await db.getMessagesByConversation(id) : [];
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  const value = useMemo(
    () => ({
      ...state,
      loading,
      isStreaming,
      dispatch,
      initializeDB,
      loadInitialData,
      createConversation,
      selectConversation,
      getConversation: async (id: string) => (db ? await db.getConversation(id) : null),
      updateConversation,
      deleteConversation: async (id: string) => {
        if (!db) return;
        // use db to delete the conversation
        await db.deleteConversation(id);
        // remove messages related to the conversation
        const messages = await db.getMessagesByConversation(id);
        await Promise.all(messages.map((msg) => db.deleteMessage(msg.id)));

        dispatch({ type: 'DELETE_CONVERSATION', payload: id });
        messages.forEach((msg) => {
          dispatch({ type: 'DELETE_MESSAGE', payload: msg.id });
        });
      },
      pinConversation,
      archiveConversation,
      sendMessage,
      getMessage: async (id: string) => (db ? await db.getMessage(id) : null),
      getMessagesByConversation: async (conversationId: string) => (db ? await db.getMessagesByConversation(conversationId) : []),
      updateMessage: async (id: string, updates: Partial<Message>) => {
        dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
      },
      deleteMessage: async (id: string) => {
        if (!db) return;
        // use db to delete the message
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
        dispatch({ type: 'UPDATE_CONFIGURATION', payload: { id, updates } });
      },
      deleteConfiguration: async (id: string) => {
        if (!db) return;
        // use db to delete the configuration
        await db.deleteConfiguration(id);
        dispatch({ type: 'DELETE_CONFIGURATION', payload: id });
      },
      getConfigurationsByType: async (type: ConfigurationType) => (db ? await db.getConfigurationsByType(type) : []),
      setPreference: async (pref: Omit<Preference, 'updatedAt'>) => {
        const updatedPref = { ...pref, updatedAt: Date.now() };
        dispatch({ type: 'SET_PREFERENCE', payload: updatedPref });
      },
      getPreference: async (userId: string, key: string) => (db ? await db.getPreference(userId, key) : null),
      getAllConfigurations: async () => (db ? await db.getAllConfigurations() : []),
      deletePreference: async () => {
        dispatch({ type: 'SET_PREFERENCE', payload: null });
      },
      abortStream,
    }),
    [state, db, loading, isStreaming, abortStream, selectConversation]
  );

  useEffect(() => {
    if (userId) {
      initializeDB().then(loadInitialData);
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
