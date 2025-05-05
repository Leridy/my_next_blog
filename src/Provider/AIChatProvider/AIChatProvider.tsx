import React, { createContext, useReducer, useEffect, useMemo, Dispatch, ReactNode, FC, useState, useContext, useCallback } from 'react';
import { ChatAppReducer, initialState } from './chatAppReducer';
import { ChatState, AppAction, Conversation, Configuration, ConfigurationType, Message, Preference, MessageRole, MessageStatus } from '@/IndexedDB/AIChat/types';
import { ChatDatabase } from '@/IndexedDB/AIChat/ChatDatabase';
import useStreamApi, { parseSSEData } from '@/app/manage/hooks/useStreamApi';
import useDebouncedStateSync from '@/Provider/AIChatProvider/dbHook';

export interface AIChatContextType extends ChatState {
  isLogin: boolean;
  loading: boolean;
  isStreaming: boolean;
  isSending: boolean;
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

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export interface AIChatProviderProps {
  userId: string | null;
  bizName?: string;
  apiURL?: string;
  children: ReactNode;
  onRequestLogin?: () => void;
}
export const AIChatProvider: FC<AIChatProviderProps> = ({ onRequestLogin, children, userId, bizName, apiURL = 'https://ai.huashui.cc/api/ai/hello-boss' }) => {
  const [state, dispatch] = useReducer(ChatAppReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const db = useMemo(() => {
    return userId ? new ChatDatabase(userId, bizName) : null;
  }, [userId]);

  const isLogin = useMemo(() => !!userId, [userId]);

  useDebouncedStateSync(db, state);

  const initialConversationInfo = useCallback(
    (content: string) => {
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
    },
    [state.currentConversation?.id]
  );

  const { streamFetch, abortStream } = useStreamApi<{
    configurations: Configuration[];
    messages: Message[];
  }>({
    apiURL,
    onChunk: useCallback(
      (chunk: string) => {
        setIsStreaming(true);
        const parsedData = parseSSEData(chunk);
        if (parsedData.length > 0) {
          parsedData
            .filter((response) => typeof response === 'object' && response !== null)
            .map((response) => {
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
      [state.currentConversation?.id]
    ),
    onComplete: useCallback(
      async (fullResponse: string) => {
        setIsStreaming(false);
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
      [state.currentConversation, initialConversationInfo]
    ),
    onError: useCallback(
      (error: Error) => {
        setIsStreaming(false);
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
      [state.currentConversation?.id]
    ),
  });

  const initializeDB = useCallback(async () => {
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
  }, [db]);

  const loadInitialData = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      dispatch({ type: 'INITIALIZE_START' });
      const [conversations, configurations, preferences] = await Promise.all([db.getAllConversations(), db.getAllConfigurations(), db.getPreference('currentUser', 'theme')]);
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { conversations, configurations, preferences },
      });
    } catch (error) {
      dispatch({ type: 'INITIALIZE_FAILURE', error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [db]);

  const selectConversation = useCallback(
    async (id: string) => {
      dispatch({
        type: 'SET_CURRENT_CONVERSATION',
        payload: state.conversations.find((conv) => conv.id === id) || null,
      });
      const messages = db ? await db.getMessagesByConversation(id) : [];
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    },
    [db, state.conversations]
  );

  const createConversation = useCallback(
    async (title: string) => {
      if (!db) {
        if (!userId) onRequestLogin?.();
        throw new Error('Database not initialized');
      }
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
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: createdConversation });

      return id;
    },
    [db, selectConversation]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      setIsSending(true);
      try {
        let conversationId = state.currentConversation?.id;
        if (!conversationId) {
          conversationId = await createConversation('New Conversation');
          await selectConversation(conversationId);
        }

        const userMessage = {
          id: crypto.randomUUID(),
          conversationId: conversationId,
          createdAt: Date.now(),
          role: 'user' as MessageRole,
          content,
          status: 'sending' as MessageStatus,
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

        const configurations = (await db?.getAllConfigurations()) || [];
        const messages = (await db?.getMessagesByConversation(conversationId)) || [];

        await streamFetch({
          configurations,
          messages: [...messages, userMessage],
        });

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: userMessage.id,
            updates: { status: 'sent' },
          },
        });

        const updates = {
          lastMessage: content,
          updatedAt: Date.now(),
          messageCount: messages.length + 1,
        };

        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: {
            id: conversationId,
            updates,
          },
        });
      } catch (error) {
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
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    },
    [db, state.currentConversation, streamFetch, createConversation, selectConversation]
  );

  const updateConversation = useCallback(
    async (id: string, updates: Partial<Conversation>) => {
      if (!db) {
        if (!userId) onRequestLogin?.();
        throw new Error('Database not initialized');
      }
      await db.updateConversation(id, updates);
      dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, updates } });
    },
    [db]
  );

  const value = useMemo(
    () => ({
      ...state,
      isLogin,
      loading,
      isStreaming,
      isSending,
      dispatch,
      initializeDB,
      loadInitialData,
      createConversation,
      selectConversation,
      updateConversation,
      getConversation: async (id: string) => (db ? await db.getConversation(id) : null),
      deleteConversation: async (id: string) => {
        if (!db) return;
        await db.deleteConversation(id);
        const messages = await db.getMessagesByConversation(id);
        await Promise.all(messages.map((msg) => db.deleteMessage(msg.id)));
        dispatch({ type: 'DELETE_CONVERSATION', payload: id });
      },
      pinConversation: async (id: string, isPinned: boolean) => {
        await updateConversation(id, { isPinned });
      },
      archiveConversation: async (id: string, isArchived: boolean) => {
        await updateConversation(id, { isArchived });
      },
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
        if (!db) {
          if (!userId) onRequestLogin?.();
          throw new Error('Database not initialized');
        }
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
        const updatedPref = { ...pref, updatedAt: Date.now() };
        if (db) await db.setPreference(updatedPref);
        dispatch({ type: 'SET_PREFERENCE', payload: updatedPref });
      },
      getPreference: async (userId: string, key: string) => (db ? await db.getPreference(userId, key) : null),
      getAllConfigurations: async () => (db ? await db.getAllConfigurations() : []),
      deletePreference: async () => {
        dispatch({ type: 'SET_PREFERENCE', payload: null });
      },
      abortStream,
    }),
    [state, db, loading, isStreaming, isSending, abortStream, selectConversation, dispatch, initializeDB, loadInitialData, createConversation, sendMessage, updateConversation]
  );

  useEffect(() => {
    if (userId) {
      initializeDB().then(loadInitialData);
    }
  }, [userId, initializeDB, loadInitialData]);

  return <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>;
};

export const useAIChatContext = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChatContext must be used within a AIChatProvider');
  }
  return context;
};
