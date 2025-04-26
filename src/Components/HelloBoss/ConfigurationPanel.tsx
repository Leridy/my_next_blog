/**
 * ConversationPanel.tsx
 *
 */
import { useHelloBossContext } from '@/Provider/HelloBossProvider/HelloBossProvider';
import { DynamicForm } from '@/Components/ChatComponents/DynamicForm';

function ConfigurationPanel() {
  const { configurations, addConfiguration, updateConfiguration, deleteConfiguration } = useHelloBossContext();

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
