/**
 * @file MessagePanel.tsx
 * @description MessagePanel component for displaying messages in a chat application.
 */

import { useHelloBossContext } from '@/Provider/HelloBossProvider/HelloBossProvider';

export { useEffect, useState } from 'react';
import MessageBoard from '@/Components/ChatComponents/ChatMessageContainer/MessageBoard';
import MessageInputBox from '@/Components/ChatComponents/ChatMessageContainer/MessageInputBox';

function MessagePanel() {
  const { currentConversation, messages, sendMessage, currentMessage, updateMessage, deleteMessage } = useHelloBossContext();
  return (
    <>
      <MessageBoard
        currentConversationId={currentConversation?.id}
        messages={messages}
        status={currentMessage?.status}
        updateMessage={updateMessage}
        deleteMessage={deleteMessage}
      />
      <MessageInputBox
        currentConversationId={currentConversation?.id}
        sendMessage={sendMessage}
        status={currentMessage?.status}
      />
    </>
  );
}

export default MessagePanel;
