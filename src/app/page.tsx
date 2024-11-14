'use client'
import NavBar from "@/Components/NavBar";
import MainBoard from "@/Components/MainBoard/MainBoard";
import FakeMask from "@/Components/FakeMask/FakeMask";
import {UserProvider} from "@/Provider/UserProvider";
import {SiteSettingProvider} from "@/Provider/SiteSettingProvider";
import {useState} from "react";
import {UserSettingProvider} from "@/Provider/UserSettingProvider";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";


export default function Home() {
  const [keyword, setKeyword] = useState<string>('');

  return (
    <DndProvider backend={HTML5Backend}>
      <SiteSettingProvider>
        <UserSettingProvider>
          <UserProvider>
            <NavBar
              onSearch={setKeyword}
            />
            <MainBoard
              keyword={keyword}
            />
            <FakeMask/>
          </UserProvider>
        </UserSettingProvider>
      </SiteSettingProvider>
    </DndProvider>
  )
}
