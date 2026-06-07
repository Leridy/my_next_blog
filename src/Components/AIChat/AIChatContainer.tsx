import ChatLayout from '@/Components/ChatComponents/ChatLayout';
import React from 'react';
import { AIChatProvider } from '@/Provider/AIChatProvider/AIChatProvider';
import { useUserContext } from '@/Provider/UserProvider';
import ConversationPanel from '@/Components/AIChat/ConversationPanel';
import SessionTitle from '@/Components/AIChat/SessionTitle';
import MessagePanel from '@/Components/AIChat/MessagePanel';
import ConfigurationPanel from '@/Components/AIChat/ConfigurationPanel';
import UserModal from '@/Components/UserComponents/UserModal';

interface Props {
  bizName?: string;
  slogan?: string;
  apiURL?: string;
}

function AIChatContainer(props: Props) {
  const { bizName, slogan, apiURL } = props;
  const { user, modalVisible, hideModal, handleModalSuccess, modalType, showModal } = useUserContext();

  return (
    <AIChatProvider
      userId={user?.id.toString() || null}
      bizName={bizName || ''}
      apiURL={apiURL}
      onRequestLogin={() => showModal(true)}
    >
      <ChatLayout
        leftContent={slogan || 'HELLO BOSS，用 AI 打败已读不回'}
        centerContent={<SessionTitle />}
        chatPanel={<MessagePanel />}
        sessionPanel={<ConversationPanel />}
        configPanel={<ConfigurationPanel />}
      />
      {modalVisible && (
        <UserModal
          visible={modalVisible}
          onClose={hideModal}
          onLogin={handleModalSuccess}
          onRegister={handleModalSuccess}
          defaultType={modalType}
        />
      )}
    </AIChatProvider>
  );
}

export default AIChatContainer;
