'use client'
import FormItem from "antd/es/form/FormItem";
import ManageList from "@/app/manage/Components/ManageList";
import {Input, TableColumnProps} from "antd";
import {useMemo} from "react";
import {User} from "@prisma/client";

export default function ManageUser() {
  const columns = useMemo<TableColumnProps<User>[]>(() => [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ], []);

  return (
    <ManageList
      title={'用户管理'} apiURL={'user'} columns={columns}
      manageName={'user'}
    >
      <FormItem
        label={"用户名"}
        name={"name"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"邮箱"}
        name={"email"}
      >
        <Input/>
      </FormItem>
    </ManageList>
  );
}
