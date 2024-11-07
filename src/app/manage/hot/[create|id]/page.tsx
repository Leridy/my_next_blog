'use client'
import {Card, Input, Select, Space} from "antd";
import ManageForm from "@/app/manage/Components/ManageForm";
import useEditCard from "@/app/manage/hooks/useEditCard";
import {HotSpider, HotTopic} from "@prisma/client";
import FormItem from "antd/es/form/FormItem";
import useApi from "@/app/manage/hooks/useApi";
import {useEffect} from "react";
import BrandIcon from "@/Components/MainBoard/HotBoard/BrandIcon";


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
    apiURL: 'hot'
  })

  const {items: spiders, get} = useApi<HotSpider>({
    apiURL: 'spider',
  });

  useEffect(() => {
    get({});
  }, [get]);

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
        size={'small'}
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
          label={"绑定爬虫"}
          name={"spiderId"}
        >
          <Select
            allowClear
          >
            {
              spiders.map(spider => (
                <Select.Option
                  key={spider.id}
                  value={spider.id}
                >
                  <Space className={'flex justify-start align-middle'}>
                    <BrandIcon src={spider.name}/> {spider.name}
                  </Space>
                </Select.Option>
              ))
            }
          </Select>
        </FormItem>
        <FormItem
          label={"状态"}
          name={"enable"}
        >
          <Select>
            <Select.Option value={true}>启用</Select.Option>
            <Select.Option value={false}>禁用</Select.Option>
          </Select>
        </FormItem>
      </ManageForm>
    </Card>
  );
}
