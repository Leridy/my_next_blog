import ChatLayout from '@/Components/ChatComponents/ChatLayout';
import React from 'react';
import { HelloBossProvider } from '@/Provider/HelloBossProvider/HelloBossProvider';
import { useUserContext } from '@/Provider/UserProvider';
import ConversationPanel from '@/Components/HelloBoss/ConversationPanel';
import SessionTitle from '@/Components/HelloBoss/SessionTitle';
import MessagePanel from '@/Components/HelloBoss/MessagePanel';
import ConfigurationPanel from '@/Components/HelloBoss/ConfigurationPanel';

function HelloBossContainer() {
  const { user } = useUserContext();

  return (
    <HelloBossProvider userId={user?.id.toString() || null}>
      <ChatLayout
        leftContent={'HELLO BOSS，用 AI 打败已读不回'}
        centerContent={<SessionTitle />}
        chatPanel={<MessagePanel />}
        sessionPanel={<ConversationPanel />}
        configPanel={<ConfigurationPanel />}
      />
    </HelloBossProvider>
  );
}

export default HelloBossContainer;
