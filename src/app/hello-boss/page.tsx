// 初始化一个nextjs 空 page (全高全宽，使用 tailwind) 然后引入 WIPComponent
'use client';
import React from 'react';
import { SiteSettingProvider } from '@/Provider/SiteSettingProvider';
import HelloBossContainer from '@/Components/HelloBoss/HelloBossContainer';
import { UserProvider } from '@/Provider/UserProvider';

export default function HelloBoss() {
  return (
    <SiteSettingProvider>
      <UserProvider>
        <HelloBossContainer />
      </UserProvider>
    </SiteSettingProvider>
  );
}
