'use client';
import ManageList from '@/app/manage/Components/ManageList';
import FormItem from 'antd/es/form/FormItem';
import { Input, message, Select, TableColumnProps } from 'antd';
import { useCallback, useMemo, useRef } from 'react';
import ManageFormModal, { ManageFormModalRef } from '@/app/manage/Components/ManageFormModal';
import { setting } from '@prisma/client';
import dynamic from 'next/dynamic';

const MonacoEditorNoSSR = dynamic(() => import('react-monaco-editor/lib/editor'), { ssr: false });
export default function ManageSetting() {
  const modalRef = useRef<ManageFormModalRef>(null);
  const columns = useMemo<TableColumnProps<setting>[]>(
    () => [
      {
        title: '标签',
        dataIndex: 'label',
        key: 'label',
      },
      {
        title: '键',
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '值',
        dataIndex: 'value',
        key: 'value',
        overflow: 'ellipsis',
      },
      {
        title: '可见范围',
        dataIndex: 'role',
        key: 'role',
        width: 100,
        align: 'center',
        render: (role: string) => {
          return { 1: '公开', 2: '内部' }[role];
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (updatedAt: string) => {
          return new Date(updatedAt).toLocaleString();
        },
      },
    ],
    []
  );

  const handleCreate = useCallback(async () => {
    try {
      await modalRef.current?.open();
    } catch (e) {
      message.error(`操作失败 ${(e as Error).message}`);
    }
  }, []);

  const handleEdit = useCallback(async (record: setting) => {
    try {
      await modalRef.current?.open(String(record.id));
    } catch (e) {
      message.error(`操作失败 ${(e as Error).message}`);
    }
  }, []);

  return (
    <>
      <ManageList
        title={'网站设置'}
        apiURL={'setting'}
        columns={columns}
        onCreate={handleCreate}
        onEdit={handleEdit}
      >
        <FormItem
          label={'标签'}
          name={'label'}
          validateTrigger={['onBlur']}
        >
          <Input />
        </FormItem>
        <FormItem
          label={'键'}
          name={'key'}
          validateTrigger={['onBlur']}
        >
          <Input />
        </FormItem>
        <FormItem
          label={'值'}
          name={'value'}
        >
          <Input />
        </FormItem>

        <FormItem
          label={'可见范围'}
          name={'role'}
          validateTrigger={['onBlur']}
        >
          <Select
            placeholder={'请选择'}
            className={'w-full'}
          >
            <Select.Option value={'1'}>公开</Select.Option>
            <Select.Option value={'2'}>内部</Select.Option>
          </Select>
        </FormItem>
      </ManageList>
      <ManageFormModal
        titleGroup={{
          create: '创建新网站设置',
          edit: '编辑网站设置',
        }}
        apiURL={'setting'}
        ref={modalRef}
      >
        <FormItem
          label={'标签'}
          name={'label'}
          required
          rules={[{ required: true, message: '请输入标签' }]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={'键'}
          name={'key'}
          validateTrigger={['onBlur']}
          required
          rules={[{ required: true, message: '请输入键' }]}
        >
          <Input />
        </FormItem>
        <FormItem
          label={'值'}
          name={'value'}
          required
          rules={[{ required: true, message: '请输入值' }]}
        >
          <MonacoEditorNoSSR
            height="300"
            language="JSON"
            theme="vs-dark"
          />
        </FormItem>

        <FormItem
          label={'可见范围'}
          name={'role'}
          validateTrigger={['onBlur']}
          required
          rules={[{ required: true, message: '请选择可见范围' }]}
        >
          <Select
            placeholder={'请选择'}
            className={'w-full'}
          >
            <Select.Option value={'1'}>公开</Select.Option>
            <Select.Option value={'2'}>内部</Select.Option>
          </Select>
        </FormItem>
      </ManageFormModal>
    </>
  );
}
