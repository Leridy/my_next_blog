'use client'
import NavBar from "@/Components/NavBar";
import MainBoard from "@/Components/MainBoard/MainBoard";
import FakeMask from "@/Components/FakeMask/FakeMask";
import {UserProvider} from "@/Provider/UserProvider";
import {SiteSettingProvider} from "@/Provider/SiteSettingProvider";
import {useState} from "react";


export default function Home() {
  const [keyword, setKeyword] = useState<string>('');

  return (
    <SiteSettingProvider>
      <UserProvider>
        <NavBar
          onSearch={setKeyword}
        />
        <MainBoard
          keyword={keyword}
        />
        <FakeMask />
      </UserProvider>
    </SiteSettingProvider>
  )
}
