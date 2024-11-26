'use client'
import {Button, DatePicker, Input, message, Select, Space, TableColumnProps} from "antd";
import {useCallback, useEffect, useMemo, useRef} from "react";
import ManageList from "@/app/manage/Components/ManageList";
import FormItem from "antd/es/form/FormItem";
import useApi from "@/app/manage/hooks/useApi";
import {HotNews, HotSpider} from "@prisma/client";
import ManageFormModal, {ManageFormModalRef} from "@/app/manage/Components/ManageFormModal";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";


const headers = {
    'x-no-cache': 'true'
}
export default function HotList() {
  const {items: spiders, get: getSpider} = useApi<HotSpider>({
    apiURL: 'spider',
    headers,
  })

  const modalRef = useRef<ManageFormModalRef>(null);
  const columns = useMemo<TableColumnProps<HotNews>[]>(() => [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '热度',
      dataIndex: 'hotCount',
      key: 'hotCount',
      width: 80,
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
      width: 200,
      sorter: (a: HotNews, b: HotNews) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (updatedAt: string) => new Date(updatedAt).toLocaleString(),
    }
  ], [spiders]);

  const handleCreate = useCallback(async () => {
    try {
      await modalRef.current?.open();
    } catch (e) {
      message.error(`操作失败${(e as Error).message}`);
    }
  }, []);

  const handleEdit = useCallback(async (record: HotNews) => {
    try {
      await modalRef.current?.open(String(record.id));
    } catch (e) {
      message.error(`操作失败${(e as Error).message}`);
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
          label={"新闻标题"}
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
          label={"更新时间"}
          name={"updatedAt"}
        >
          <DatePicker
            //  ISO-8601 DateTime.
            allowClear
            datatype={"date"}
            showNow
            showTime
          />
        </FormItem>
        <FormItem
          label={"关联爬虫"}
          name={"spiderId"}
        >
          <Select
            allowClear
          >
            {spiders?.map((item: HotSpider) => (
              <Select.Option key={item.id} value={item.id}>
                <Space className={'flex justify-start align-middle'}>
                  <BrandIcon src={item.name}/> {item.name}
                </Space>
              </Select.Option>
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
              <Select.Option key={item.id} value={item.id}>
                <Space className={'flex justify-start align-middle'}>
                  <BrandIcon src={item.name}/> {item.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      </ManageFormModal>
    </>
  );
}
