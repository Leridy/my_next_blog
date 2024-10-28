'use client'
import {Button, Card, Modal, Table, TableColumnProps} from "antd";
import {useHotData} from "./hooks/useHotData";
import {useEffect, useState} from "react";
import FilterForm from "@/app/manage/hot/Components/FilterForm";
import {useRouter} from "next/navigation";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";


export default function HotList() {
  const router = useRouter();
  const {fetch, hotList, loading, remove} = useHotData();
  const [deleteInfo, setDeleteInfo] = useState<{ id: string, name: string } | null>(null);

  const handleDelete = async (data: typeof deleteInfo) => {
    setDeleteInfo(data);
  }

  const handleConfirmDelete = async () => {
    if (!deleteInfo) return;
    await remove(deleteInfo?.id);
    setDeleteInfo(null);
    fetch();
  }


  /**
   *   id          Int      @id @default(autoincrement())
   *   name        String   @unique
   *   icon        String   @default("")
   *   description String   @default("")
   *   url         String   @unique
   *   image       String   @default("")
   */
  const columns: TableColumnProps[] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 80,
    },
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
    {
      title: '操作',
      render: ({id, name}) => {
        return (
          <div>
            <Button
              size={"small"}
              type={"link"}
              onClick={() => router.push(`/manage/hot/${id}`)}
            >编辑</Button>
            <Button
              danger
              size={"small"}
              type={"text"}
              onClick={() => handleDelete({id, name})}
            >删除</Button>
          </div>
        )
      }
    }
  ];

  const handleCreate = () => {
    router.push('/manage/hot/create');
  }

  useEffect(() => {
    fetch();
  }, []);

  const renderTitle = () => {
    return (
      <div
        style={{display: 'flex', justifyContent: 'space-between'}}
      >
        <h3>热榜栏目</h3>
        <Button
          size={'small'}
          type={"primary"}
          onClick={handleCreate}
        >+</Button>
      </div>
    )
  }

  return (
    <Card
      title={renderTitle()}
      size={"small"}
      className={'flex-1 h-full'}
      loading={loading}
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
        dataSource={hotList}
      />

      <Modal
        title={`确认删除${deleteInfo?.name}吗?`}
        open={!!deleteInfo}
        onOk={handleConfirmDelete}
        loading={loading}
        onCancel={() => setDeleteInfo(null)}
      >
        <p>确认删除吗
          <span
            className={'text-red-500 font-bold'}
          >{deleteInfo?.name}</span> ?
          此操作不可逆</p>

      </Modal>
    </Card>
  );
}
