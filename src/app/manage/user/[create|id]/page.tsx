'use client';
import { Card, Input, Select } from 'antd';
import ManageForm from '@/app/manage/Components/ManageForm';
import FormItem from 'antd/es/form/FormItem';
import useEditCard from '@/app/manage/hooks/useEditCard';
import { User } from '@prisma/client';

export default function UserCreate() {
  const {
    cardTitle,
    handleSubmit,
    handleCancel,
    loading,
    initialValues,
    isEditMode,
  } = useEditCard<User>({
    titleGroup: {
      create: '创建新用户',
      edit: '编辑用户',
    },
    fallbackPath: '/manage/user',
    apiURL: 'user',
  });

  return (
    <Card title={cardTitle} size={'small'} className={'h-full'}>
      {initialValues?.password
        ? `用户加密后密码:${initialValues.password}`
        : null}
      <ManageForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialValues={initialValues}
      >
        <FormItem
          label={'名称'}
          name={'name'}
          required
          rules={[{ required: true, message: '请输入名称' }]}
          validateTrigger={['onBlur']}
        >
          <Input />
        </FormItem>
        <FormItem
          label={'邮箱'}
          name={'email'}
          required
          rules={[{ required: true, message: '请输入邮箱' }]}
          validateTrigger={['onBlur']}
        >
          <Input />
        </FormItem>

        <FormItem
          label={'密码'}
          name={'password'}
          rules={[{ required: !isEditMode, message: '请输入密码' }]}
          validateTrigger={['onBlur']}
        >
          <Input.Password />
        </FormItem>

        <FormItem
          label={'确认密码'}
          name={'password2'}
          rules={[{ required: !isEditMode, message: '请输入确认密码' }]}
          validateTrigger={['onBlur']}
        >
          <Input.Password />
        </FormItem>

        <FormItem
          label={'角色'}
          name={'role'}
          required
          rules={[{ required: true, message: '请输入角色' }]}
          validateTrigger={['onBlur']}
        >
          <Select>
            <Select.Option value={'2'}>管理员</Select.Option>
            <Select.Option value={'1'}>用户</Select.Option>
          </Select>
        </FormItem>
      </ManageForm>
    </Card>
  );
}
