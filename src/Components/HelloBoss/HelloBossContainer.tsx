import WIPComponent from '@/Components/WIPComponent/WIPComponent';
import ChatLayout from '@/Components/ChatComponents/ChatLayout';
import React from 'react';
import { HelloBossProvider } from '@/Provider/HelloBossProvider/HelloBossProvider';
import { useUserContext } from '@/Provider/UserProvider';
import ConversationPanel from '@/Components/HelloBoss/ConversationPanel';
import SessionTitle from '@/Components/HelloBoss/SessionTitle';
import MessagePanel from '@/Components/HelloBoss/MessagePanel';

function HelloBossContainer() {
  const { user } = useUserContext();

  return (
    <HelloBossProvider userId={user?.id.toString() || null}>
      <ChatLayout
        leftContent={'HELLO BOSS，用 AI 打败已读不回'}
        centerContent={<SessionTitle />}
        chatPanel={<MessagePanel />}
        sessionPanel={<ConversationPanel />}
        configPanel={<WIPComponent message={'🚧 👷 🏗️ 划水网，正在整个大的 Hello Boss 功能横空出世， 敬请期待...'} />}
      />
    </HelloBossProvider>
  );
}

export default HelloBossContainer;
