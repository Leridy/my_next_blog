'use client';
import { Badge, Button, Input, message, TableColumnProps } from 'antd';
import { useCallback, useMemo } from 'react';
import BrandIcon from '@/Components/MainBoard/HotBoard/BrandIcon';
import ManageList from '@/app/manage/Components/ManageList';
import FormItem from 'antd/es/form/FormItem';
import useApi from '@/app/manage/hooks/useApi';
import { NetworkError } from '@/http';

const colors = ['green', 'yellow', 'red'];

export default function HotSpiderList() {
  const { get: triggerSpiderRefresh } = useApi({
    apiURL: 'spider/trigger',
    headers: {
      'x-ignore-error': 'true',
      'x-no-cache': 'true',
    },
  });

  const handleRefresh = useCallback(
    async (name: string) => {
      try {
        // @ts-expect-error name is ok
        await triggerSpiderRefresh({ name });
        message.success('更新成功');
      } catch (e) {
        message.error((e as NetworkError).bizMessage);
      }
    },
    [triggerSpiderRefresh]
  );

  /**
   *   id          Int      @id @default(autoincrement())
   *   name        String   @unique
   *   icon        String   @default("")
   *   description String   @default("")
   *   url         String   @unique
   *   image       String   @default("")
   */
  const columns = useMemo<TableColumnProps[]>(
    () => [
      {
        title: '爬虫名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '图标',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        render: (name: string) => (
          <div className={'flex justify-center'}>
            <BrandIcon src={name} />
          </div>
        ),
        align: 'center',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (updatedAt: string) => {
          const now = new Date();
          const lastUpdate = new Date(updatedAt);
          const diff = now.getTime() - lastUpdate.getTime();
          let color = colors[0];
          if (diff > 1000 * 60 * 60) {
            color = colors[1];
          }
          if (diff > 1000 * 60 * 60 * 24) {
            color = colors[2];
          }
          return (
            <div className={'flex gap-1'}>
              <Badge color={color} />
              {new Date(updatedAt).toLocaleString()}
            </div>
          );
        },
      },
      {
        title: '立即更新',
        dataIndex: 'name',
        key: 'name',
        render: (name) => {
          return (
            <Button
              type={'link'}
              size={'small'}
              onClick={() => handleRefresh(name)}
            >
              更新
            </Button>
          );
        },
      },
    ],
    [handleRefresh]
  );

  return (
    <ManageList
      title={'爬虫管理'}
      apiURL={'spider'}
      columns={columns}
      showCreate={false}
      showOperation={false}
    >
      <FormItem label={'爬虫名称'} name={'name'}>
        <Input />
      </FormItem>
      <FormItem label={'爬虫描述'} name={'description'}>
        <Input />
      </FormItem>
    </ManageList>
  );
}
