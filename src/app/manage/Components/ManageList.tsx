import type {ColumnProps} from "antd/es/table";
import {Button, Card, CardProps, message, Modal, Space, Table, TableColumnProps,} from "antd";
import FilterForm from "@/app/manage/Components/FilterForm";
import useApi from "@/app/manage/hooks/useApi";
import {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";

interface ManageListProps<T> {
  title: ReactNode;
  apiURL: string;
  columns: ColumnProps<T>[];
  manageName?: string; // 目前正在管理的模块的名称
  cardProps?: CardProps
  onEdit?: (record: T) => Promise<void> | void;
  onDelete?: (record: T) => Promise<void> | void;
  onCreate?: () => Promise<void> | void;
  onClickItem?: (record: T) => void;
  children?: ReactNode;
}

export default function ManageList<T>(props: ManageListProps<T>) {
  const {
    title,
    apiURL,
    columns,
    cardProps = {},
    manageName,
    onEdit,
    onDelete,
    onCreate,
    onClickItem,
    children,
  } = props;

  const router = useRouter();
  const pathname = usePathname() || '';

  const {get, del, items, loading} = useApi<T>({
    apiURL,
    exception: manageName === 'user' ? {type: 'user'} : undefined
  });

  const [queryData, setQueryData] = useState<Partial<T>>({});

  const handleDelete = useCallback(async (record: T) => {
    // if onDelete is not provided, use default delete function
    if (!onDelete) {
      Modal.confirm({
        title: '删除',
        content: '确认删除吗, 删除后不可恢复',
        onOk: async () => {
          try {
            // @ts-expect-error there must have ID
            await del(record.id);
            message.success('删除成功');
            await get(queryData);
          } catch (e) {
            console.error(e);
            message.error('删除失败');
          }
        }
      });
      return;
    } else {
      try {
        onDelete(record);
        await get(queryData);
      } catch (e) {
        message.error('操作失败');
      }

    }
  }, [del, get, onDelete, queryData]);

  const handleEdit = useCallback(async (record: T) => {
    if (onEdit) {
      try {
        await onEdit(record);
        get(queryData);
      } catch (e) {
        message.error('操作失败');
      }
    } else {
      // @ts-expect-error there must have ID
      router.push(`${pathname}/${record.id}`);
    }
  }, [manageName, onEdit, router]);

  const handleCreate = useCallback(async () => {
    if (onCreate) {
      try {
        await onCreate();
        get(queryData);
      } catch (e) {
        message.error('操作失败');
      }
    } else {
      // the create name is formPath
      router.push(`${pathname}/create`);

    }
  }, [get, onCreate, pathname, queryData, router]);


  const columnsConfig = useMemo<TableColumnProps<T>[]>(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center'
    },
    ...columns,
    {
      title: '操作',
      key: 'action',
      render: (record: T) => {
        return (
          <Space>
            <Button
              size={"small"}
              type={"link"}
              onClick={() => {
                handleEdit(record);
              }}
            >编辑</Button>
            <Button
              danger
              size={"small"}
              type={"link"}
              onClick={() => {
                handleDelete(record);
              }}
            >
              删除
            </Button>
          </Space>
        )
      }
    }
  ], [columns, handleDelete, handleEdit]);

  const renderTitle = useMemo(() => {
    return (
      <div
        style={{display: 'flex', justifyContent: 'space-between'}}
      >
        <h3>{title}</h3>
        <Button
          size={'small'}
          type={"primary"}
          onClick={handleCreate}
        >+</Button>
      </div>
    )
  }, [handleCreate]);

  useEffect(() => {
    get(queryData);
  }, [get, queryData]);

  return (
    <Card
      {...cardProps}
      title={renderTitle}
      className={'h-full'}
      size={"small"}
    >
      {
        children && (
          <div className={'mb-4'}>
            <FilterForm onSearch={setQueryData}>
              {children}
            </FilterForm>
          </div>
        )
      }

      <Table
        size={"small"}
        scroll={{y: 'calc(100vh - 350px)'}}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['10', '15', '20', '50', '100'],
          showSizeChanger: true,
        }}
        dataSource={items}
        columns={columnsConfig}
        loading={loading}
        rowKey={'id'}
        onRow={(record) => {
          return {
            onClick: () => onClickItem?.(record)
          }
        }}
      />
    </Card>
  )
}


