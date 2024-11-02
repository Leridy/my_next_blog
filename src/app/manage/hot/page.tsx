'use client'
import {Button, Input, TableColumnProps} from "antd";
import {useMemo} from "react";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";
import ManageList from "@/app/manage/Components/ManageList";
import FormItem from "antd/es/form/FormItem";


export default function HotList() {
  /**
   *   id          Int      @id @default(autoincrement())
   *   name        String   @unique
   *   icon        String   @default("")
   *   description String   @default("")
   *   url         String   @unique
   *   image       String   @default("")
   */
  const columns = useMemo<TableColumnProps[]>(() => [
    {
      title: '栏目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon: string) =>
        <div className={'flex justify-center'}>
          <BrandIcon src={icon}/>
        </div>
      ,
      align: 'center'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '链接',
      dataIndex: 'url',
      render: (url: string) => (<Button type={"link"} href={url}>{url}</Button>),
      key: 'url',
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
    },
  ], []);


  return (
    <ManageList
      title={'热门栏目管理'}
      apiURL={'hot'}
      columns={columns}
    >
      <FormItem
        label={"栏目名称"}
        name={"name"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"栏目描述"}
        name={"description"}
      >
        <Input/>
      </FormItem>
    </ManageList>
  );
}
