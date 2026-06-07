/**
 * @file MessagePanel.tsx
 * @description MessagePanel component for displaying messages in a chat application.
 */

import { useAIChatContext } from '@/Provider/AIChatProvider/AIChatProvider';

export { useEffect, useState } from 'react';
import MessageBoard from '@/Components/ChatComponents/ChatMessageContainer/MessageBoard';
import MessageInputBox from '@/Components/ChatComponents/ChatMessageContainer/MessageInputBox';

function MessagePanel() {
  const { currentConversation, messages, sendMessage, streamMessage, updateMessage, deleteMessage, createConversation } = useAIChatContext();
  return (
    <>
      <MessageBoard
        currentConversationId={currentConversation?.id}
        messages={[...messages, streamMessage].filter((ele) => ele !== undefined)}
        status={streamMessage?.status}
        updateMessage={updateMessage}
        deleteMessage={deleteMessage}
      />
      <MessageInputBox
        currentConversationId={currentConversation?.id}
        sendMessage={sendMessage}
        status={streamMessage?.status}
        onCreateConversation={createConversation}
      />
    </>
  );
}

export default MessagePanel;
