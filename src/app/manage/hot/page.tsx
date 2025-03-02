'use client';
import { Button, Input, Select, TableColumnProps } from 'antd';
import { useEffect, useMemo } from 'react';
import BrandIcon from '@/Components/MainBoard/HotBoard/BrandIcon';
import ManageList from '@/app/manage/Components/ManageList';
import FormItem from 'antd/es/form/FormItem';
import useApi from '@/app/manage/hooks/useApi';
import { HotSpider } from '@prisma/client';

const headers = {
  'x-no-cache': 'true',
};
export default function HotList() {
  const { items: spiders, get: getSpider } = useApi<HotSpider>({
    apiURL: 'spider',
    headers,
  });
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
        title: '栏目名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '图标',
        dataIndex: 'icon',
        key: 'icon',
        width: 100,
        render: (icon: string) => (
          <div className={'flex justify-center'}>
            <BrandIcon src={icon} />
          </div>
        ),
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'enable',
        key: 'enable',
        width: 100,
        render: (enable: boolean) => (enable ? '启用' : '禁用'),
      },
      {
        title: '关联爬虫',
        dataIndex: 'spiderId',
        key: 'spiderId',
        width: 100,
        align: 'center',
        render: (spiderId: number) => {
          const currentSpider = spiders?.find(
            (item: HotSpider) => item.id === spiderId
          );
          return currentSpider?.name || '未知';
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '链接',
        dataIndex: 'url',
        render: (url: string) => (
          <Button type={'link'} href={url}>
            {url}
          </Button>
        ),
        key: 'url',
      },
    ],
    [spiders]
  );

  useEffect(() => {
    getSpider({});
  }, [getSpider]);

  return (
    <ManageList title={'热门栏目管理'} apiURL={'hot'} columns={columns}>
      <FormItem label={'栏目名称'} name={'name'}>
        <Input />
      </FormItem>
      <FormItem label={'栏目描述'} name={'description'}>
        <Input />
      </FormItem>
      <FormItem label={'使用状态'} name={'enable'}>
        <Select
          allowClear
          style={{
            width: '100px',
          }}
        >
          <Select.Option value={true}>启用</Select.Option>
          <Select.Option value={false}>禁用</Select.Option>
        </Select>
      </FormItem>
    </ManageList>
  );
}
