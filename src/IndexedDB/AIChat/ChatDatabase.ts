// ChatDatabase.ts
import { Conversation, Message, Configuration, Preference, TableName, ConfigurationType } from './types';

export class ChatDatabase {
  private dbName: string;
  private db: IDBDatabase | null = null;
  private version = 1;

  constructor(
    private userId: string,
    private bizName?: string
  ) {
    this.dbName = `boss-ai-${userId}${bizName ? `-${bizName}` : ''}`;
  }

  async initialize(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log('Initializing database...');
      console.table({
        dbName: this.dbName,
        version: this.version,
        userId: this.userId,
        bizName: this.bizName,
      });
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        // @ts-ignore
        this.injectMockData().then(() => resolve(this.db));
      };

      request.onupgradeneeded = (event) => {
        console.warn('Upgrading database...', event);
        const db = request.result;
        this.createConversationsTable(db);
        this.createMessagesTable(db);
        this.createConfigurationsTable(db);
        this.createPreferencesTable(db);
      };
    });
  }

  private createConversationsTable(db: IDBDatabase) {
    const store = db.createObjectStore('conversations', { keyPath: 'id' });
    store.createIndex('createdAt', 'createdAt', { unique: false });
    store.createIndex('updatedAt', 'updatedAt', { unique: false });
    store.createIndex('isPinned', 'isPinned', { unique: false });
    store.createIndex('isArchived', 'isArchived', { unique: false });
  }

  private createMessagesTable(db: IDBDatabase) {
    const store = db.createObjectStore('messages', { keyPath: 'id' });
    store.createIndex('conversationId', 'conversationId', { unique: false });
    store.createIndex('createdAt', 'createdAt', { unique: false });
    store.createIndex('status', 'status', { unique: false });
    store.createIndex('role', 'role', { unique: false });
    store.createIndex('conversationId_createdAt', ['conversationId', 'createdAt'], { unique: false });
  }

  private createConfigurationsTable(db: IDBDatabase) {
    const store = db.createObjectStore('configurations', { keyPath: 'id' });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('isActive', 'isActive', { unique: false });
    store.createIndex('createdAt', 'createdAt', { unique: false });
  }

  private createPreferencesTable(db: IDBDatabase) {
    const store = db.createObjectStore('preferences', { keyPath: ['userId', 'key'] });
    store.createIndex('userId', 'userId', { unique: false });
    store.createIndex('key', 'key', { unique: false });
  }

  private async withTransaction<T>(storeName: TableName, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Conversation CRUD operations
  async addConversation(conversation: Omit<Conversation, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const fullConversation: Conversation = {
      ...conversation,
      id,
      createdAt: now,
      updatedAt: now,
      isPinned: conversation.isPinned ?? false,
      isArchived: conversation.isArchived ?? false,
      configId: conversation.configId ?? null,
      lastMessage: conversation.lastMessage ?? '',
      messageCount: conversation.messageCount ?? 0,
      tags: conversation.tags ?? [],
      modelUsed: conversation.modelUsed ?? 'default',
    };

    await this.withTransaction('conversations', 'readwrite', (store) => store.add(fullConversation));
    return id;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.withTransaction('conversations', 'readonly', (store) => store.get(id));
  }

  async getAllConversations(): Promise<Conversation[]> {
    return this.withTransaction('conversations', 'readonly', (store) => store.getAll()).then((conversations) => conversations.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const conversation = await this.getConversation(id);
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }

    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.withTransaction('conversations', 'readwrite', (store) => store.put(updatedConversation));
  }

  async deleteConversation(id: string): Promise<void> {
    await this.withTransaction('conversations', 'readwrite', (store) => store.delete(id));

    // Delete associated messages
    const messages = await this.getMessagesByConversation(id);
    await Promise.all(messages.map((msg) => this.withTransaction('messages', 'readwrite', (store) => store.delete(msg.id))));
  }

  // Message CRUD operations
  async addMessage(message: Message): Promise<string> {
    const fullMessage: Message = {
      ...message,
      createdAt: message.createdAt ?? Date.now(),
      status: message.status ?? 'pending',
      tokens: message.tokens ?? 0,
      generationTime: message.generationTime ?? 0,
      isModified: message.isModified ?? false,
      model: message.model ?? 'default',
      error: message.error ?? null,
      parentMessageId: message.parentMessageId ?? null,
    };

    await this.withTransaction('messages', 'readwrite', (store) => store.add(fullMessage));
    return message.id;
  }

  async getMessage(id: string): Promise<Message | null> {
    return this.withTransaction('messages', 'readonly', (store) => store.get(id));
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.withTransaction('messages', 'readonly', (store) => {
      const index = store.index('conversationId');
      return index.getAll(conversationId);
    });
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<void> {
    const message = await this.getMessage(id);
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }

    const updatedMessage = {
      ...message,
      ...updates,
    };

    await this.withTransaction('messages', 'readwrite', (store) => store.put(updatedMessage));
  }

  async deleteMessage(id: string): Promise<void> {
    await this.withTransaction('messages', 'readwrite', (store) => store.delete(id));
  }

  // Configuration CRUD operations
  async addConfiguration(config: Omit<Configuration, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const fullConfig: Configuration = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isActive: config.isActive ?? true,
      description: config.description ?? '',
      schema: config.schema ?? undefined,
      order: config.order ?? 0,
    };

    await this.withTransaction('configurations', 'readwrite', (store) => store.add(fullConfig));
    return id;
  }

  async getConfiguration(id: string): Promise<Configuration | null> {
    return this.withTransaction('configurations', 'readonly', (store) => store.get(id));
  }

  async getConfigurationsByType(type: ConfigurationType): Promise<Configuration[]> {
    return this.withTransaction('configurations', 'readonly', (store) => {
      const index = store.index('type');
      return index.getAll(type);
    });
  }

  async getAllConfigurations(): Promise<Configuration[]> {
    return this.withTransaction('configurations', 'readonly', (store) => store.getAll()).then((configs) => configs.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async updateConfiguration(id: string, updates: Partial<Configuration>): Promise<void> {
    const config = await this.getConfiguration(id);
    if (!config) {
      throw new Error(`Configuration with id ${id} not found`);
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.withTransaction('configurations', 'readwrite', (store) => store.put(updatedConfig));
  }

  async deleteConfiguration(id: string): Promise<void> {
    await this.withTransaction('configurations', 'readwrite', (store) => store.delete(id));
  }

  // Preference CRUD operations
  async setPreference(preference: Omit<Preference, 'updatedAt'>): Promise<void> {
    const fullPreference: Preference = {
      ...preference,
      updatedAt: Date.now(),
      syncFlag: preference.syncFlag ?? false,
    };

    await this.withTransaction('preferences', 'readwrite', (store) => store.put(fullPreference));
  }

  async getPreference(userId: string, key: string): Promise<Preference | null> {
    return this.withTransaction('preferences', 'readonly', (store) => store.get([userId, key]));
  }

  async getPreferencesByUser(userId: string): Promise<Preference[]> {
    return this.withTransaction('preferences', 'readonly', (store) => {
      const index = store.index('userId');
      return index.getAll(userId);
    });
  }

  async deletePreference(userId: string, key: string): Promise<void> {
    await this.withTransaction('preferences', 'readwrite', (store) => store.delete([userId, key]));
  }

  // 在ChatDatabase类中添加私有方法
  private async injectMockData() {
    if (process.env.NODE_ENV === 'development') {
      const { mockConversations, mockMessages, mockConfigurations, mockPreferences } = await import('./mockData');

      // 检查是否已有数据，避免重复注入
      const existing = await this.getAllConversations();
      if (existing.length === 0) {
        console.log('Injecting mock data...');
        await Promise.all([...mockConversations.map((c) => this.addConversation(c)), ...mockMessages.map((m) => this.addMessage(m)), ...mockConfigurations.map((c) => this.addConfiguration(c)), ...mockPreferences.map((p) => this.setPreference(p))]);
      }
    }
  }
}
