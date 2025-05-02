// ignore all ts error in this file
// @ts-nocheck

// test.ts
import { ChatDatabase } from './ChatDatabase';

async function runTests() {
  const db = new ChatDatabase('test-user');

  try {
    await db.initialize();
    console.log('Database initialized successfully');

    // Test conversations
    const convId = await db.addConversation({
      title: 'Test Conversation',
      messageCount: 0,
    });
    console.log('Added conversation:', convId);

    await db.updateConversation(convId, { title: 'Updated Title' });
    console.log('Updated conversation');

    const conversation = await db.getConversation(convId);
    console.log('Got conversation:', conversation);

    const allConversations = await db.getAllConversations();
    console.log('All conversations:', allConversations);

    // Test messages
    const messageId = await db.addMessage({
      conversationId: convId,
      role: 'user',
      content: 'Hello world',
    });
    console.log('Added message:', messageId);

    const messages = await db.getMessagesByConversation(convId);
    console.log('Messages for conversation:', messages);

    // Test configurations
    const configId = await db.addConfiguration({
      name: 'Test Config',
      type: 'boss-role',
      content: { role: 'CEO' },
      isActive: true,
    });
    console.log('Added configuration:', configId);

    // Test preferences
    await db.setPreference({
      userId: 'test-user',
      key: 'theme',
      value: 'dark',
    });
    console.log('Set preference');

    const themePref = await db.getPreference('test-user', 'theme');
    console.log('Got theme preference:', themePref);

    // Cleanup
    await db.deleteConversation(convId);
    console.log('Deleted conversation and associated messages');

    return {
      db,
      conversationId: convId,
      messageId,
      configId,
    };
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Expose to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).testChatDB = runTests;
}
