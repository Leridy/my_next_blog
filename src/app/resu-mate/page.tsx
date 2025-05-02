// 初始化一个nextjs 空 page (全高全宽，使用 tailwind) 然后引入 WIPComponent
'use client';
import React from 'react';
import { SiteSettingProvider } from '@/Provider/SiteSettingProvider';
import AIChatContainer from '@/Components/AIChat/AIChatContainer';
import { UserProvider } from '@/Provider/UserProvider';

export default function ResuMate() {
  return (
    <SiteSettingProvider>
      <UserProvider>
        <AIChatContainer
          bizName={'ResuMate'}
          slogan={'简历有AI，匹配无阻碍'}
          apiURL={'https://ai.huashui.cc/api/ai/resumate'}
        />
      </UserProvider>
    </SiteSettingProvider>
  );
}
