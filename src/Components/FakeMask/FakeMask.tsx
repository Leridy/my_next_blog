'use client'
import {Button, Input} from "antd";
import {useCallback, useEffect, useMemo, useState} from "react";
import './FakeMask.style.scss'
import {useSiteSettingContext} from "@/Provider/SiteSettingProvider";
import useSettingMap from "@/Components/hooks/useSettingMap";
import InputtingText from "@/Components/InputtingText/InputtingText";

const SITE_SETTING_KEY = 'FakeMask';

/**
 * FakeMask
 * @constructor
 * @description 这是一个模仿搜索的组件，它看起来像百度搜索的搜索结果，使用 Bing 的搜索引擎
 */
export default function FakeMask() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [logoAnimation, setLogoAnimation] = useState<string>('shakeAndUpDown .3s ease-in-out infinite');
  const [fakeMode, setFakeMode] = useState<boolean>(false);

  const {setting} = useSiteSettingContext();

  const {enable, MaintainedMode, MaintainedContent} = useSettingMap<{
    enable: boolean;
    MaintainedMode: boolean;
    MaintainedContent: string;
  }>({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: {
      enable: true,
      MaintainedMode: false,
      MaintainedContent: '网站维护中，请稍后再试...',
    }
  })

  const toggleFakeMode = useCallback(() => {
    if (!MaintainedMode) {
      setFakeMode((prev) => !prev);
    }
  }, [MaintainedMode])

  const changeToFakeMode = useCallback(() => {
    setFakeMode(true);
  }, [])

  const handlePressEsc = useCallback((e: { key: string; }) => {
    if (e.key === 'Escape') {
      toggleFakeMode();
    }
  }, [toggleFakeMode]);

  useEffect(() => {
    if (MaintainedMode && fakeMode) {
      document.title = String(MaintainedContent);
    } else {
      document.title = fakeMode ? '必应搜索' : '🚣‍♀️划水网 - 一个划水的网站';
    }

  }, [MaintainedContent, MaintainedMode, fakeMode]);


  const handleSearch = useCallback(() => {
    if (searchValue) window.open(`https://cn.bing.com/search?q=${searchValue}`);
  }, [searchValue]);

  useEffect(() => {
    const handler = setInterval(() => {
      const animations = [
        'shakeAndUpDown .2s ease-in-out infinite',
        'rotate3D 3s ease-in-out infinite',
        '',
        '',
        '',
      ]
      setLogoAnimation(animations[Math.floor(Math.random() * animations.length)]);
    }, 20000);

    return () => {
      clearInterval(handler);
    }
  }, []);

  const renderSearch = useMemo(() => {
    return (
      <>
        <div
          className={'mb-8 flex logo'}
          onDoubleClick={toggleFakeMode}
          style={{
            animation: logoAnimation,
          }}
        >
          <img
            className={'w-60'}
            src={'/icons/bing.svg'} alt={'bing'}
            title={'双击 logo 关闭'}
          />
        </div>

        <div>
          <Input
            placeholder={''}
            style={{width: '400px'}}
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            onPressEnter={handleSearch}
          />
          <Button
            type={'primary'}
            style={{marginLeft: '1rem'}}
            onClick={handleSearch}
          >必应搜索</Button>
        </div>

      </>
    )
  }, [handleSearch, logoAnimation, searchValue, toggleFakeMode])

  useEffect(() => {
    if (MaintainedMode && enable) {
      setFakeMode(true);
    }
    // 当这个窗口（tab）切换到后台的时候，开启 fakeMode
    window.addEventListener('blur', changeToFakeMode);
    // while press esc key, enter fake mode
    window.addEventListener('keydown', handlePressEsc);


    return () => {
      window.removeEventListener('blur', changeToFakeMode);
      window.removeEventListener('keydown', handlePressEsc);
    }
  }, [MaintainedContent, MaintainedMode, changeToFakeMode, enable, handlePressEsc]);

  return (
    fakeMode && enable && (
      <div
        className={'fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center fake-mask'}
        style={{
          zIndex: 9999,
          transition: 'all 0.5s',
        }}
      >
        <div
          className={'flex flex-col items-center justify-start cursor-pointer'}
          style={{
            transform: 'translateY(-220px)',
          }}
        >

          {MaintainedMode ? (
            <div className={'text-red-500 text-lg'}>
              <InputtingText
                text={String(MaintainedContent)}
                cursorBlinkSpeed={'fast'}
                hideCursor={String(MaintainedContent).includes('<br/>')}
              />
            </div>
          ) : renderSearch}

        </div>

      </div>
    )
  )
}
