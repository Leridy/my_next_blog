'use client';
import Avatar from '@/Components/NavBar/Avatar';
import LoginBox from '../LoginBox/LoginBox';
import { useUserContext } from '@/Provider/UserProvider';
import { Button, Tooltip } from 'antd';
import { EditFilled } from '@ant-design/icons';
import { useCallback } from 'react';
import { useUserSettingContext } from '@/Provider/UserSettingProvider';
import AddToFavoritesButton from '@/Components/NavBar/AddToFavoritesButton/AddToFavoritesButton';

export default function UserBox() {
  const { user } = useUserContext();
  const { topicSettingMode, setTopicSettingMode } = useUserSettingContext();
  const handleToggleTopicSetting = useCallback(() => {
    setTopicSettingMode(!topicSettingMode);
  }, [setTopicSettingMode, topicSettingMode]);

  return (
    <div className="flex justify-end">
      <Tooltip title={topicSettingMode ? '退出定制' : '定制你的首页'}>
        <Button
          type="link"
          onClick={handleToggleTopicSetting}
          title={'进入编辑模式'}
        >
          {topicSettingMode ? (
            <EditFilled style={{ color: 'red' }} />
          ) : (
            <EditFilled />
          )}
        </Button>
      </Tooltip>

      <AddToFavoritesButton />

      {user ? <Avatar name={user.name} /> : <LoginBox />}
    </div>
  );
}
