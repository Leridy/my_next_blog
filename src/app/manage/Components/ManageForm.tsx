'use client';
import { Button, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from 'antd/es/form/FormItem';
import { useEffect } from 'react';

interface ManageFormProps<T> {
  onSubmit?: (params: Partial<T>) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: T | null;
  children?: React.ReactNode;
  size?: 'small' | 'large';
}

export default function ManageForm<T>(props: ManageFormProps<T>) {
  const {
    onSubmit,
    onCancel,
    loading,
    initialValues,
    children,
    size = 'small',
  } = props;
  const [form] = useForm<Partial<T>>();

  const handleSubmit = async () => {
    try {
      const result = await form.validateFields();
      onSubmit?.(result);
    } catch (e) {
      console.log('error', e);
      message.error('请检查输入');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout={'horizontal'}
      wrapperCol={{ span: size === 'small' ? 8 : 20 }}
      labelCol={{ span: size === 'small' ? 2 : 4 }}
      initialValues={initialValues || {}}
    >
      {children}

      <FormItem wrapperCol={{ offset: size === 'small' ? 2 : 4 }}>
        <Button type={'primary'} onClick={handleSubmit} loading={loading}>
          提交
        </Button>
        <Button
          type={'default'}
          className={'ml-2'}
          onClick={handleCancel}
          loading={loading}
        >
          取消
        </Button>
      </FormItem>
    </Form>
  );
}
