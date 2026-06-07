import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Form, Modal, Select, Button, message, Input } from 'antd';
import dynamic from 'next/dynamic';
import { Configuration } from '@/IndexedDB/AIChat/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export const CONFIG_TYPES = [
  { value: 'resume', label: '简历' },
  { value: 'boss-role', label: 'Boss角色' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'extra', label: '额外配置' },
  { value: 'jd', label: '岗位信息' },
];

export interface ConfigEditorModalRef {
  open: (config?: Partial<Configuration>) => Promise<Configuration | undefined>;
}

export interface ConfigEditorModalProps {
  pRef: React.RefObject<HTMLDivElement | undefined>;
}

export const ConfigEditorModal = forwardRef<ConfigEditorModalRef, ConfigEditorModalProps>((props, ref) => {
  const { pRef } = props;
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<(value: Configuration | undefined) => void>();

  useImperativeHandle(ref, () => ({
    open: (config?: Partial<Configuration>) => {
      return new Promise<Configuration | undefined>((resolve) => {
        setResolvePromise(() => resolve);
        setVisible(true);
        form.resetFields();
        if (config) {
          form.setFieldsValue(config);
        }
      });
    },
  }));

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      resolvePromise?.(values);
      setVisible(false);
    } catch (error) {
      message.error('请填写完整信息');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resolvePromise?.(undefined);
    setVisible(false);
  };

  return (
    <Modal
      title="编辑配置"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      getContainer={pRef.current || undefined}
      footer={[
        <Button
          key="back"
          onClick={handleCancel}
        >
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          保存
        </Button>,
      ]}
      width="80%"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="配置名称"
          rules={[{ required: true, message: '请输入配置名称' }]}
        >
          <Input placeholder="输入配置名称" />
        </Form.Item>
        <Form.Item
          name="type"
          label="配置类型"
          rules={[{ required: true, message: '请选择配置类型' }]}
        >
          <Select options={CONFIG_TYPES} />
        </Form.Item>
        <Form.Item
          name="content"
          label="配置内容"
        >
          <MDEditor height={400} />
        </Form.Item>
      </Form>
    </Modal>
  );
});
