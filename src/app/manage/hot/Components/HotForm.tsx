'use client'
import {Button, Form, Input} from "antd";
import {useForm} from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import {HotTopic} from "@prisma/client";
import {useEffect} from "react";

interface HotFormProps {
  onSubmit?: (params: Partial<HotTopic>) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Partial<HotTopic> | null;
}

export default function HotForm(props: HotFormProps) {
  const {onSubmit, onCancel, loading, initialValues} = props;
  const [form] = useForm<HotTopic>();

  const handleSubmit = () => {
    const result = form.getFieldsValue();
    onSubmit?.(result);
  }

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  }

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues])

  return (
    <Form
      form={form}
      layout={'horizontal'}
      wrapperCol={{span: 8}}
      labelCol={{span: 2}}
      initialValues={initialValues || {}}
    >
      <FormItem
        label={"名称"}
        name={"name"}
        required
        rules={[{required: true, message: '请输入名称'}]}
        validateTrigger={['onBlur']}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"图标"}
        name={"icon"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"描述"}
        name={"description"}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"链接"}
        name={"url"}
        rules={[{required: true, type: 'url', message: '请输入正确的链接'}]}
      >
        <Input/>
      </FormItem>
      <FormItem
        label={"图片"}
        name={"image"}
      >
        <Input/>
      </FormItem>

      <FormItem
        wrapperCol={{offset: 2}}
      >
        <Button
          type={"primary"}
          onClick={
            handleSubmit
          }
          loading={loading}
        >提交</Button>
        <Button
          type={"default"} className={'ml-2'}
          onClick={
            handleCancel
          }
          loading={loading}
        >取消</Button>
      </FormItem>
    </Form>
  );
}
