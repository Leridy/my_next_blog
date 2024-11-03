import Card from "@/Components/Card";
import Avatar from "@/Components/NavBar/Avatar";
import {useUserContext} from "@/Provider/UserProvider";
import {useCallback, useEffect, useMemo, useState} from "react";
import './UserProfile.style.scss'
import InputtingText from "@/Components/InputtingText/InputtingText";
import {sayings, someEmoji, politeWords2} from "@/mock/emojiAndSayings";
import {Button, message, Space} from "antd";
import {DesktopOutlined, LogoutOutlined, SettingFilled} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {Role} from "@/server/middlewares";
import {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";
import {useSiteSettingContext} from "@/Provider/SiteSettingProvider";
import useSettingMap from "@/Components/hooks/useSettingMap";


const SITE_SETTING_KEY = 'UserBoard.UserProfile';

export default function UserProfile() {
  const {user, requestLogout} = useUserContext();
  const router = useRouter();
  const {setting} = useSiteSettingContext();

  const {setting: settingEntry} = useSettingMap({
    baseKey: SITE_SETTING_KEY,
    setting,
    subKeys: [
      'setting',
    ]
  })

  const [oldSaying, setOldSaying] = useState<string>('你好 👋');

  const {name, createdAt, role} = useMemo<UserInfo>(() => {
      return user || {name: '', createdAt: new Date(), role: Role.USER} as UserInfo;
    }, [user]
  )


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
      oldSaying = politeWords2[Math.floor(Math.random() * politeWords2.length)]
    }

    setOldSaying(oldSaying);
  }, [name]);

  const renderActions = useMemo(() => {
    return (
      <Space>
        {
          settingEntry ? (
            <Button
              size={"small"}
              type={"link"}
              onClick={
                () => {
                  message.info('功能暂未开放');
                }}
            >
              <SettingFilled/> 设置
            </Button>
          ) : null
        }

        {
          name && <Button
                size={"small"}
                type={"link"}
                onClick={
                  async () => {
                    await requestLogout();
                    message.success('登出成功，感谢划水时间的陪伴');
                    router.push('/');
                  }}
            >
                <LogoutOutlined/> 登出
            </Button>
        }

        {
          role >= Role.ADMIN && (
            <Button
              size={"small"}
              type={"link"}
              onClick={
                () => {
                  router.push('/manage');
                }}
            >
              <DesktopOutlined/> 管理
            </Button>
          )
        }
      </Space>
    )
  }, [requestLogout, name]);

  useEffect(() => {
    const handler = setInterval(() => {
      generateSaying();
    }, 10000);

    return () => {
      clearInterval(handler);
    }
  }, [generateSaying]);

  return (
    <Card
      header={<h1>User Profile</h1>}
      actions={
        renderActions
      }
    >
      {/*使用grid 布局， 将内容分为 三行三列，其中第一 二个项目占 三列，*/}
      <div className={'h-full grid grid-rows-3 grid-cols-3 gap-2'}>
        <div
          className={'flex justify-center items-center user-profile-avatar'}
          style={{gridColumn: 'span 3'}}
        >
          <Avatar
            size={'medium'}
            name={name || '客人'}
          />
        </div>

        <div
          className={'flex justify-center items-center'}
          style={{gridColumn: 'span 3'}}
        >
          <strong className={'text-lg'}>
            {name ?
              <InputtingText text={`${name},${oldSaying}`} cursorBlinkSpeed={'fast'} key={name}/> :
              <InputtingText text={oldSaying} cursorBlinkSpeed={'fast'} key={oldSaying}/>
            }
          </strong>

        </div>

        <div
          style={{gridColumn: 'span 1'}}
          className={'grid grid-rows-2 gap-2 justify-center items-center'}
        >
          <span
            className={' font-bold'}
          >Today</span>
          <span
            className={'text-center'}
          >0</span>
        </div>
        <div
          style={{gridColumn: 'span 1'}}
          className={'grid grid-rows-2 gap-2 justify-center'}
        >
          <span
            className={' font-bold'}
          >Total</span>
          <span
            className={'text-center'}
          >0</span>
        </div>
        <div
          style={{gridColumn: 'span 1'}}
          className={'grid grid-rows-2 gap-2 justify-center items-center'}
        >
          <span
            className={'font-bold'}
          >Joined</span>
          <span
            className={'text-center'}
          >
              {joinedDays}
          </span>
        </div>
      </div>
    </Card>
  )
}
