import { useAIChatContext } from '@/Provider/AIChatProvider/AIChatProvider';

function SessionTitle() {
  const { currentConversation } = useAIChatContext();

  // use tailwindcss to style the title
  return (
    <div className="flex items-center justify-center w-full h-16 ">
      <h1 className="text-2xl font-bold ">{currentConversation?.title || '会话标题'}</h1>
    </div>
  );
}

export default SessionTitle;
