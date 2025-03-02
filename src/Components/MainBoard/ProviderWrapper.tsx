'use client';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { SiteSettingProvider } from '@/Provider/SiteSettingProvider';
import { UserProvider } from '@/Provider/UserProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainBoard from '@/Components/MainBoard/MainBoard';
import NavBar from '@/Components/NavBar';
import FakeMask from '@/Components/FakeMask/FakeMask';
import dynamic from 'next/dynamic';

const UserSettingProviderNoSSR = dynamic(() => import('@/Provider/UserSettingProvider'), { ssr: false });

export default function ProviderWrapper() {
  const [keyword, setKeyword] = useState<string>('');

  return (
    <DndProvider backend={HTML5Backend}>
      <SiteSettingProvider>
        <UserSettingProviderNoSSR>
          <UserProvider>
            <NavBar onSearch={setKeyword} />
            <MainBoard keyword={keyword} />
            <FakeMask />
          </UserProvider>
        </UserSettingProviderNoSSR>
      </SiteSettingProvider>
    </DndProvider>
  );
}
