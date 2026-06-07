import Card from '@/Components/Card';
import Avatar from '@/Components/NavBar/Avatar';
import { useUserContext } from '@/Provider/UserProvider';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import './UserProfile.style.scss';
import InputtingText from '@/Components/InputtingText/InputtingText';
import { sayings, someEmoji, politeWords2 } from '@/mock/emojiAndSayings';
import { Button, message, Space } from 'antd';
import { DesktopOutlined, LoadingOutlined, LogoutOutlined, SettingFilled } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Role } from '@/server/middlewares';
import { UserInfo } from '@/Components/UserComponents/hooks/useUserAuthData';
import { useSiteSettingContext } from '@/Provider/SiteSettingProvider';
import useSettingMap from '@/Components/hooks/useSettingMap';
import useApi from '@/app/manage/hooks/useApi';
import { motion } from 'framer-motion';

const SITE_SETTING_KEY = 'UserBoard.UserProfile';

export default function UserProfile() {
  const { user, requestLogout } = useUserContext();
  const router = useRouter();
  const { setting } = useSiteSettingContext();

  const { setting: settingEntry } = useSettingMap<{ setting: boolean }>({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: ['setting'],
  });

  const {
    getOne: getVisitorCount,
    loading: visitorLoading,
    data: visitorCount,
  } = useApi<{
    todayVisitorCount: number;
    totalVisitorCount: number;
    newVisitorCount: number;
  }>({
    apiURL: '/statistic/visitor',
  });

  const [oldSaying, setOldSaying] = useState<string>('你好 👋');

  const { name, createdAt, role } = useMemo<UserInfo>(() => {
    return user || ({ name: '', createdAt: new Date(), role: Role.USER } as UserInfo);
  }, [user]);

  const joinedDays = useMemo(() => {
    if (!createdAt) {
      return 0;
    }
    const now = new Date();
    const joined = new Date(createdAt);
    return Math.floor((now.getTime() - joined.getTime()) / (1000 * 3600 * 24));
  }, [createdAt]);

  const generateSaying = useCallback(() => {
    let oldSaying = '';
    if (!name) {
      const prefixEmoji = someEmoji[Math.floor(Math.random() * someEmoji.length)];
      const suffixEmoji = someEmoji[Math.floor(Math.random() * someEmoji.length)];
      oldSaying = prefixEmoji + ' ' + sayings[Math.floor(Math.random() * sayings.length)] + ' ' + suffixEmoji;
    } else {
      oldSaying = politeWords2[Math.floor(Math.random() * politeWords2.length)];
    }

    setOldSaying(oldSaying);
  }, [name]);

  const renderActions = useMemo(() => {
    const actions = [
      settingEntry && (
        <Button
          size={'small'}
          type={'link'}
          onClick={() => {
            message.info('功能暂未开放');
          }}
        >
          <SettingFilled /> 设置
        </Button>
      ),

      name && (
        <Button
          size={'small'}
          type={'link'}
          onClick={async () => {
            await requestLogout();
            message.success('登出成功，感谢划水时间的陪伴');
            router.push('/');
          }}
        >
          <LogoutOutlined /> 登出
        </Button>
      ),

      role >= Role.ADMIN && (
        <Button
          size={'small'}
          type={'link'}
          onClick={() => {
            router.push('/manage');
          }}
        >
          <DesktopOutlined /> 管理
        </Button>
      ),
    ].filter(Boolean);
    return (
      <Space>
        {actions.length > 0 ? (
          actions.map((action) => action)
        ) : (
          <div className={'flex justify-center flex-col items-center w-full'}>
            这里有登录后才有的功能哦
            <InputtingText
              text={oldSaying}
              cursorBlinkSpeed={'fast'}
              key={'old-saying'}
            />
          </div>
        )}
      </Space>
    );
  }, [settingEntry, name, role, requestLogout, router, oldSaying]);

  useEffect(() => {
    const handler = setInterval(() => {
      generateSaying();
    }, 10000);

    return () => {
      clearInterval(handler);
    };
  }, [generateSaying]);

  useEffect(() => {
    getVisitorCount('count');
  }, [getVisitorCount]);

  const renderUserInfo = useCallback((data: { label: string; value: number | ReactNode }[]) => {
    return (
      <>
        {data.map(({ label, value }) => (
          <div
            key={label}
            style={{ gridColumn: 'span 1' }}
            className={'grid grid-rows-2 gap-2 justify-center items-center'}
          >
            <span className={'font-bold'}>{label}</span>
            <span className={'text-center'}>{value}</span>
          </div>
        ))}
      </>
    );
  }, []);

  const visitorInfoData = useMemo(() => {
    return [
      {
        label: '新水友',
        value: visitorLoading ? <LoadingOutlined spin={true} /> : visitorCount?.newVisitorCount || 0,
      },
      {
        label: '今日上线水友',
        value: visitorLoading ? <LoadingOutlined spin={true} /> : visitorCount?.todayVisitorCount || 0,
      },
      {
        label: '所有水友',
        value: visitorLoading ? <LoadingOutlined spin={true} /> : visitorCount?.totalVisitorCount || 0,
      },
    ];
  }, [visitorCount, visitorLoading]);

  const userInfoData = useMemo(() => {
    return [
      {
        label: '今天查看',
        value: 0,
      },
      {
        label: '所有信息',
        value: 0,
      },
      {
        label: '加入天数',
        value: joinedDays,
      },
    ];
  }, [joinedDays]);

  const renderVisitorInfo = useMemo(() => renderUserInfo(visitorInfoData), [visitorInfoData, renderUserInfo]);
  const renderInfo = useMemo(() => renderUserInfo(userInfoData), [userInfoData, renderUserInfo]);

  return (
    <Card
      header={<h1>用户</h1>}
      actions={renderActions}
    >
      <motion.div
        className={'h-full grid grid-rows-3 grid-cols-3 gap-4'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={'flex justify-center items-center user-profile-avatar'}
          style={{ gridColumn: 'span 3' }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Avatar
            size={'medium'}
            name={name || '客人'}
          />
        </motion.div>

        <motion.div
          className={'flex justify-center items-center'}
          style={{ gridColumn: 'span 3' }}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <strong className={'text-lg bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] bg-clip-text text-opacity-10 text-[var(--color-primary-transparent)]'}>
            {name ? (
              <InputtingText
                text={`${name},${oldSaying}`}
                cursorBlinkSpeed={'fast'}
                key={name}
              />
            ) : (
              <InputtingText
                text={oldSaying}
                cursorBlinkSpeed={'fast'}
                key={'old-saying'}
              />
            )}
          </strong>
        </motion.div>

        <motion.div
          className="col-span-3 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {name ? renderInfo : renderVisitorInfo}
        </motion.div>
      </motion.div>
    </Card>
  );
}
