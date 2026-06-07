// types.ts
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'sent' | 'failed';
export type ConfigurationType = 'resume' | 'boss-role' | 'display' | 'preference' | 'extra' | 'prompt' | 'jd';
export type ThemePreference = 'light' | 'dark';

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isArchived: boolean;
  configId: string | null;
  lastMessage: string;
  messageCount: number;
  tags: string[];
  modelUsed: string;
}

export interface Message {
  id: string;
  conversationId: string;
  createdAt: number;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  tokens?: number;
  generationTime?: number;
  isModified?: boolean;
  model?: string;
  error?: string | null;
  parentMessageId?: string | null;
}

export interface Configuration {
  id: string;
  name: string;
  type: ConfigurationType;
  description?: string;
  content: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  version: number;
  schema?: object;
  order?: number;
}

export interface Preference {
  userId: string;
  key: string;
  value: string | number;
  updatedAt: number;
  syncFlag?: boolean;
}

export interface DatabaseTables {
  conversations: Conversation;
  messages: Message;
  configurations: Configuration;
  preferences: Preference;
}

export type TableName = keyof DatabaseTables;

// types.ts (扩展部分)
export type AppStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  streamMessage?: Message;
  configurations: Configuration[];
  preferences: Preference | null;
  status: AppStatus;
  error: string | null;
}

export type AppAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: Partial<ChatState> }
  | { type: 'INITIALIZE_FAILURE'; error: string }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'UPDATE_STREAM_MESSAGE_CONTENT'; payload: Message }
  // reset stream message
  | { type: 'RESET_STREAM_MESSAGE' }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] | null }
  | { type: 'ADD_CONFIGURATION'; payload: Configuration }
  | { type: 'UPDATE_CONFIGURATION'; payload: { id: string; updates: Partial<Configuration> } }
  | { type: 'DELETE_CONFIGURATION'; payload: string }
  | { type: 'SET_PREFERENCE'; payload: Preference | null };
