'use client';
import Avatar from '@/Components/NavBar/Avatar';
import LoginBox from '../LoginBox/LoginBox';
import { useUserContext } from '@/Provider/UserProvider';
import { Button, Dropdown, Tooltip } from 'antd';
import { EditFilled, SkinOutlined } from '@ant-design/icons';
import { useCallback, useEffect } from 'react';
import { useUserSettingContext } from '@/Provider/UserSettingProvider';
import AddToFavoritesButton from '@/Components/NavBar/AddToFavoritesButton/AddToFavoritesButton';
import HelloBossButton from '@/Components/NavBar/HelloBossButton/HelloBossButton';

export default function UserBox() {
  const { user } = useUserContext();
  const { topicSettingMode, setTopicSettingMode } = useUserSettingContext();

  const handleToggleTopicSetting = useCallback(() => {
    setTopicSettingMode(!topicSettingMode);
  }, [setTopicSettingMode, topicSettingMode]);

  const handleThemeChange = useCallback((theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    // 存储用户选择的主题到localStorage
    localStorage.setItem('selectedTheme', theme);
  }, []);

  const themeItems = [
    { key: 'default', label: '默认主题' },
    { key: 'summer', label: '夏日主题' },
    { key: 'spring', label: '春天主题' },
    { key: 'autumn', label: '秋冬主题' },
    { key: 'programmer', label: '程序员主题' },
    { key: 'office', label: '办公主题' },
  ];

  useEffect(() => {
    // 检查localStorage中是否有用户选择的主题
    const userSelectedTheme = localStorage.getItem('selectedTheme');

    if (!userSelectedTheme) {
      // 如果没有用户选择的主题，则根据月份自动选择
      const month = new Date().getMonth() + 1;
      let autoTheme = 'default';

      // 春季主题 (3-5月)
      if (month >= 3 && month <= 5) {
        autoTheme = 'spring';
      }
      // 夏季主题 (6-8月)
      else if (month >= 6 && month <= 8) {
        autoTheme = 'summer';
      }
      // 秋季主题 (9-11月)
      else if (month >= 9 && month <= 11) {
        autoTheme = 'autumn';
      }
      // 冬季使用默认主题 (12-2月)

      document.documentElement.setAttribute('data-theme', autoTheme);
    } else {
      // 使用用户选择的主题
      document.documentElement.setAttribute('data-theme', userSelectedTheme);
    }
  }, []);

  return (
    <div className="flex justify-end items-center gap-2">
      <Tooltip title={topicSettingMode ? '退出定制' : '定制你的首页'}>
        <Button
          type="link"
          onClick={handleToggleTopicSetting}
          title={'进入编辑模式'}
        >
          {topicSettingMode ? <EditFilled style={{ color: 'red' }} /> : <EditFilled />}
        </Button>
      </Tooltip>

      <Dropdown
        menu={{
          items: themeItems,
          onClick: ({ key }) => handleThemeChange(key),
        }}
        placement="bottomRight"
      >
        <Button
          type="link"
          icon={<SkinOutlined />}
        />
      </Dropdown>

      <AddToFavoritesButton />
      <HelloBossButton />
      {user ? <Avatar name={user.name} /> : <LoginBox />}
    </div>
  );
}
