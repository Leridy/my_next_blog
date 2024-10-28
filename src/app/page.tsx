'use client'
import {useCallback, useEffect, useState} from "react";
import NavBar from "@/Components/NavBar";
import MainBoard from "@/Components/MainBoard/MainBoard";
import FakeMask from "@/Components/FakeMask/FakeMask";

export default function Home() {
  const [keyword, setKeyword] = useState<string>('');
  const [fakeMode, setFakeMode] = useState<boolean>(false);

  const toggleFakeMode = useCallback(() => {
    setFakeMode((prev) => !prev);
  }, [])

  const changeToFakeMode = useCallback(() => {
    setFakeMode(true);
  }, [])

  const handlePressEsc = useCallback((e: { key: string; }) => {
    if (e.key === 'Escape') {
      toggleFakeMode();
    }
  }, [toggleFakeMode]);

  useEffect(() => {
    document.title = fakeMode ? '必应搜索' : '🚣‍♀️划水网 - 一个划水的网站';
  }, [fakeMode]);

  useEffect(() => {
    // 当这个窗口（tab）切换到后台的时候，开启 fakeMode
    window.addEventListener('blur', changeToFakeMode);
    // while press esc key, enter fake mode
    window.addEventListener('keydown', handlePressEsc);

    return () => {
        window.removeEventListener('blur', changeToFakeMode);
        window.removeEventListener('keydown', handlePressEsc);
    }
  }, [changeToFakeMode, handlePressEsc]);

  return (
    <>
      <NavBar
        onSearch={setKeyword}
      />
      <MainBoard
        keyword={keyword}
      />
      {fakeMode && <FakeMask
          onExit={toggleFakeMode}
      />}
    </>

  )
}
