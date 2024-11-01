'use client'
import {Button, Card, Space, Table, TableColumnProps} from "antd";
import {useCallback, useEffect, useMemo} from "react";
import {useRouter} from "next/navigation";
import useUserData from "@/app/manage/user/hooks/useUserData";
import {User} from "@prisma/client";
import FilterForm from "@/app/manage/user/Components/FilterForm";

export default function ManageUser() {
  const router = useRouter();

  const {fetch, users} = useUserData();

  const handleCreate = useCallback(() => {
    router.push('/manage/user/create');
  }, [router]);

  useEffect(() => {
    fetch({});
  }, [fetch]);

  const columns = useMemo<TableColumnProps[]>(() => [
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
    {
      title: '操作',
      key: 'action',
      render: (record: User) => {
        return (
          <Space>
            <Button
              size={"small"}
              type={"link"}
              onClick={() => {
                router.push(`/manage/user/${record.id}`);
              }}
            >查看</Button>

            <Button
              danger
              size={"small"}
              type={"link"}
              onClick={() => {
                console.log('delete', record);
              }}
            >删除</Button>
          </Space>

        )
      }
    }
  ], [router]);

  const renderTitle = useMemo(() => {
    return (
      <div
        style={{display: 'flex', justifyContent: 'space-between'}}
      >
        <h3>用户列表</h3>
        <Button
          size={'small'}
          type={"primary"}
          onClick={handleCreate}
        >+</Button>
      </div>
    )
  }, [handleCreate]);

  return (
    <Card
      title={renderTitle}
      size={"small"}
      className={'flex-1 h-full'}
      // loading={loading}
    >
      <div className={'mb-4'}>
        <FilterForm onSearch={fetch}/>
      </div>

      <Table
        columns={columns}
        size={"small"}
        scroll={{y: 'calc(100vh - 350px)'}}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['10', '15', '20', '50', '100'],
          showSizeChanger: true,
        }}
        dataSource={users}
      />
    </Card>
  );
}
