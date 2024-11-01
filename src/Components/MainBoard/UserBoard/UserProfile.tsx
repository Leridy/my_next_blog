import Card from "@/Components/Card";
import Avatar from "@/Components/NavBar/Avatar";
import {useUserContext} from "@/Provider/UserProvider";
import {useEffect, useMemo, useState} from "react";
import './UserProfile.style.scss'
import InputtingText from "@/Components/InputtingText/InputtingText";
import {sayings, someEmoji} from "@/mock/emojiAndSayings";
import {Button, Space} from "antd";
import {SettingFilled, UserOutlined} from "@ant-design/icons";


export default function UserProfile() {
  const {user} = useUserContext();

  const [oldSaying, setOldSaying] = useState<string>('有朋自远方来，不亦乐乎');

  const {name, createdAt} = useMemo<{ name: string, createdAt: Date }>(
    () => {
      return user || {name: '', createdAt: new Date()};
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

  const renderActions = useMemo(() => {
    return (
      <Space>
        <Button
          size={"small"}
          type={"link"}
          onClick={
            () => {
              console.log('click user');
            }}
        >
          <SettingFilled/> Setting
        </Button>
      </Space>

    )
  }, []);

  useEffect(() => {
    const handler = setInterval(() => {
      const prefixEmoji = someEmoji[Math.floor(Math.random() * someEmoji.length)];
      const suffixEmoji = someEmoji[Math.floor(Math.random() * someEmoji.length)];
      const oldSaying = prefixEmoji + ' ' + sayings[Math.floor(Math.random() * sayings.length)] + ' ' + suffixEmoji;
      setOldSaying(oldSaying);
    }, 10000);

    return () => {
      clearInterval(handler);
    }
  }, []);

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
            {name ? <InputtingText text={name}/> : <InputtingText text={oldSaying} cursorBlinkSpeed={'fast'}/>}
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
