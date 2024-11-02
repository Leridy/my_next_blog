'use client'
import {Card, Input} from "antd";
import ManageForm from "@/app/manage/Components/ManageForm";
import useEditCard from "@/app/manage/hooks/useEditCard";
import {HotTopic} from "@prisma/client";
import FormItem from "antd/es/form/FormItem";


export default function HotEditor() {
  const {
    cardTitle,
    handleSubmit,
    handleCancel,
    initialValues
  } = useEditCard<HotTopic>({
    titleGroup: {
      create: '创建新热搜',
      edit: '编辑热搜'
    },
    fallbackPath: '/manage/hot',
    apiURL: '/hot'
  })

  return (
    <Card
      title={cardTitle}
      size={"small"}
      className={'h-full'}
    >
      <ManageForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialValues={initialValues}
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
      </ManageForm>
    </Card>
  );
}
