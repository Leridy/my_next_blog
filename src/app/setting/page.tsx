'use client'
import {useEffect, useState} from "react";
import useApi from "@/app/manage/hooks/useApi";
import {HotTopic} from "@prisma/client";
import {Form} from "antd";
import FormItem from "antd/es/form/FormItem";
import OrderBoard from "@/Components/OrderBoard/OrderBoard";

export interface UserSetting {
  topicConfig: {
    orderMap: Map<number, number> // 热搜栏目排序
    exclude: number[] // 不显示的热搜栏目id
  }
}

export default function SettingPage() {

  const {get: getHotList, items} = useApi<HotTopic>({
    apiURL: 'hot'
  });

  const [userSetting, setUserSetting] = useState<UserSetting>({
    topicConfig: {
      orderMap: new Map<number, number>(),
      exclude: []
    }
  });

  useEffect(() => {
    getHotList({
      enable: true
    });
  }, [getHotList]);

  useEffect(() => {
    // if orderMap in topicConfig is empty, set it to default
    if (userSetting.topicConfig.orderMap.size === 0) {
      const orderMap = new Map<number, number>();
      items.forEach((item, index) => {
        orderMap.set(item.id, index);
      });
      setUserSetting(prev => {
        console.log('set orderMap', orderMap);
        return {
          ...prev,
          topicConfig: {
            ...prev.topicConfig,
            orderMap
          }
        }
      });
    }
  }, [items, userSetting.topicConfig.orderMap.size]);

  return (
    <div
      className={'p-4'}
    >
      <h1
        className={'text-2xl font-bold pb-4'}
      >
        栏目设置
      </h1>

      <Form
        layout={'vertical'}
      >
        <FormItem
          label={'热搜栏目排序'}
        >
          <OrderBoard
            onChange={console.log}
            initialValue={userSetting.topicConfig.orderMap}
          />
        </FormItem>
      </Form>

      <p>
        {JSON.stringify(items)}
      </p>
    </div>
  )
}
