// 初始化一个nextjs 空 page (全高全宽，使用 tailwind) 然后引入 WIPComponent

import React from 'react';
import WIPComponent from '@/Components/WIPComponent/WIPComponent';
import AIChatLayout from '@/Components/HelloBoss/AIChatLayout';

export default function HelloBoss() {
  return (
    <AIChatLayout
      leftContent={'HELLO BOSS，用 AI 打败已读不回'}
      chatPanel={<WIPComponent message={'🚧 👷 🏗️ 划水网，正在整个大的 Hello Boss 功能横空出世， 敬请期待...'} />}
      sessionPanel={<WIPComponent message={'会话面板暂未实现'} />}
      configPanel={<WIPComponent message={'配置面板暂未实现'} />}
    />
  );
}
