'use client'
import {Button, Input, message, Select, TableColumnProps} from "antd";
import {useCallback, useEffect, useMemo, useRef} from "react";
import ManageList from "@/app/manage/Components/ManageList";
import FormItem from "antd/es/form/FormItem";
import useApi from "@/app/manage/hooks/useApi";
import {HotNews, HotSpider} from "@prisma/client";
import ManageFormModal, {ManageFormModalRef} from "@/app/manage/Components/ManageFormModal";


export default function HotList() {
  const {items: spiders, get: getSpider} = useApi<HotSpider>({
    apiURL: 'spider',
  })

  const modalRef = useRef<ManageFormModalRef>(null);
  const columns = useMemo<TableColumnProps<HotNews>[]>(() => [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '链接',
      dataIndex: 'url',
      render: (url: string) => (<Button type={"link"} href={url}>{url}</Button>),
    },
    {
      title: '关联爬虫',
      dataIndex: 'spiderId',
      key: 'spiderId',
      width: 100,
      align: 'center',
      render: (spiderId: number) => {
        const currentSpider = spiders?.find((item: HotSpider) => item.id === spiderId);
        return currentSpider?.name || '未知';
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) => new Date(updatedAt).toLocaleString(),
    }
  ], [spiders]);

  const handleCreate = useCallback(async () => {
    try {
      await modalRef.current?.open();
    } catch (e) {
      message.error('操作失败');
    }
  }, []);

  const handleEdit = useCallback(async (record: HotNews) => {
    try {
      await modalRef.current?.open(String(record.id));
    } catch (e) {
      message.error('操作失败');
    }
  }, []);

  useEffect(() => {
    getSpider()
  }, [getSpider]);


  return (
    <>
      <ManageList
        title={'热门新闻管理'}
        apiURL={'news'}
        columns={columns}
        usePagination
        onCreate={handleCreate}
        onEdit={handleEdit}
      >
        <FormItem
          label={"新闻名称"}
          name={"title"}
        >
          <Input/>
        </FormItem>
        <FormItem
          label={"新闻描述"}
          name={"description"}
        >
          <Input/>
        </FormItem>
        <FormItem
          label={"关联爬虫"}
          name={"spiderId"}
        >
          <Select>
            <Select.Option>全部</Select.Option>
            {spiders?.map((item: HotSpider) => (
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            ))}
          </Select>
        </FormItem>
      </ManageList>

      <ManageFormModal
        titleGroup={{
          create: '创建新热门文章',
          edit: '编辑热门文章'
        }}
        apiURL={'news'}
        ref={modalRef}
      >
        <FormItem
          label={"新闻标题"}
          name={"title"}
          validateTrigger={['onBlur']}
          required
          rules={[{required: true, message: '请输入新闻标题'}]}
        >
          <Input/>
        </FormItem>
        <FormItem
          label={"新闻描述"}
          name={"description"}
          validateTrigger={['onBlur']}
        >
          <Input/>
        </FormItem>
        <FormItem
          label={"新闻链接"}
          name={"url"}
          validateTrigger={['onBlur']}
          required
          rules={[{required: true, type: 'url', message: '请输入正确的链接'}]}
        >
          <Input/>
        </FormItem>
        <FormItem
          label={"关联爬虫"}
          name={"spiderId"}
          validateTrigger={['onBlur']}
          required
          rules={[{required: true, message: '请选择关联爬虫'}]}
        >
          <Select>
            {spiders?.map((item: HotSpider) => (
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            ))}
          </Select>
        </FormItem>
      </ManageFormModal>
    </>
  );
}
