/**
 * ConversationPanel.tsx
 *
 */
import ConversationList from '@/Components/ChatComponents/Conversition/ConversitionList';
import { useHelloBossContext } from '@/Provider/HelloBossProvider/HelloBossProvider';

function ConversationPanel() {
  const { conversations, currentConversation, pinConversation, archiveConversation, selectConversation, createConversation, deleteConversation, loading } = useHelloBossContext();

  /**
   * create and select a new conversation
   */
  const handleNewConversation = async () => {
    const id = await createConversation('新的会话');
    selectConversation(id);
  };

  /**
   * handle delete conversation
   */

  return (
    <ConversationList
      currentId={currentConversation?.id}
      onSelect={selectConversation}
      onNewConversation={handleNewConversation}
      conversations={conversations}
      onArchive={archiveConversation}
      onPin={pinConversation}
      onDelete={deleteConversation}
      loading={loading}
    />
  );
}

export default ConversationPanel;
