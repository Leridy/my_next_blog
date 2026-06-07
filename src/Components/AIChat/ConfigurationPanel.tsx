/**
 * ConversationPanel.tsx
 *
 */
import { useAIChatContext } from '@/Provider/AIChatProvider/AIChatProvider';
import { DynamicForm } from '@/Components/ChatComponents/DynamicForm';

function ConfigurationPanel() {
  const { configurations, addConfiguration, updateConfiguration, deleteConfiguration } = useAIChatContext();

  /**
   * handle delete conversation
   */

  return (
    <DynamicForm
      configurations={configurations}
      onAdd={addConfiguration}
      onDelete={deleteConfiguration}
      onUpdate={updateConfiguration}
    />
  );
}

export default ConfigurationPanel;
