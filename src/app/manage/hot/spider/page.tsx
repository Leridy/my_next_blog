'use client'
import {Input, TableColumnProps} from "antd";
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
      title: '爬虫名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
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
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) => new Date(updatedAt).toLocaleString(),
    }
  ], []);


  return (
    <ManageList
      title={'爬虫管理'}
      apiURL={'spider'}
      columns={columns}
      showCreate={false}
    >
      <FormItem
        label={"爬虫名称"}
        name={"name"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"爬虫描述"}
        name={"description"}
      >
        <Input/>
      </FormItem>
    </ManageList>
  );
}
