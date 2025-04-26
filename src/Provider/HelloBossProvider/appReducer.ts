// appReducer.ts
import { HelloBossState, AppAction } from '@/IndexedDB/HelloBoss/types';

export const initialState: HelloBossState = {
  conversations: [], // 会话列表
  currentConversation: null, // 当前会话
  streamMessage: undefined, // 流消息
  messages: [],
  configurations: [],
  preferences: null,
  status: 'idle',
  error: null,
};

export function appReducer(state: HelloBossState, action: AppAction): HelloBossState {
  // console.log('appReducer', action);
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, status: 'loading' };

    case 'INITIALIZE_SUCCESS':
      return { ...state, ...action.payload, status: 'succeeded' };

    case 'INITIALIZE_FAILURE':
      return { ...state, status: 'failed', error: action.error };

    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'UPDATE_CONVERSATION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) => (conv.id === id ? { ...conv, ...updates, updatedAt: Date.now() } : conv)),
      };
    }

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        messages: state.messages.filter((msg) => msg.conversationId !== action.payload),
        currentConversation: state.currentConversation?.id === action.payload ? null : state.currentConversation,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'UPDATE_MESSAGE': {
      const { id, updates } = action.payload;
      return {
        ...state,
        messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
      };
    }

    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    // replace the messages with the new ones
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload || [],
      };

    case 'UPDATE_STREAM_MESSAGE_CONTENT':
      return {
        ...state,
        streamMessage: {
          ...state.streamMessage,
          ...action.payload,
          content: (state.streamMessage?.content || '') + (action.payload.content || ''),
        },
      };

    case 'RESET_STREAM_MESSAGE':
      return {
        ...state,
        streamMessage: undefined,
      };

    case 'ADD_CONFIGURATION':
      return {
        ...state,
        configurations: [...state.configurations, action.payload],
      };

    case 'UPDATE_CONFIGURATION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        configurations: state.configurations.map((config) => (config.id === id ? { ...config, ...updates, updatedAt: Date.now() } : config)),
      };
    }

    case 'DELETE_CONFIGURATION':
      return {
        ...state,
        configurations: state.configurations.filter((config) => config.id !== action.payload),
      };

    case 'SET_PREFERENCE':
      return {
        ...state,
        preferences: action.payload,
      };

    default:
      return state;
  }
}
