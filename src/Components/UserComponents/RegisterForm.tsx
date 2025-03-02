import { useState } from 'react';
import { Button, Form, Input, message, Space } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import type { RegisterData } from './type';
import './UserModal.style.scss';

interface RegisterFormProps {
  onRegister: (data: RegisterData) => void;
  loading?: boolean;
}

export default function RegisterForm(props: RegisterFormProps) {
  const { onRegister, loading } = props;
  const [form] = Form.useForm<RegisterData>();
  const [randomKey, setRandomKey] = useState(Math.random());

  const handleChangeValidateCode = () => {
    setRandomKey((prevState) => prevState + 1);
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onRegister(values);
    } catch (e) {
      console.error(e);
      message.error(`请检查输入的内容`);
    }
  };

  return (
    <Form form={form} layout={'vertical'}>
      <FormItem label={'用户名'} name={'name'} rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder={'请输入用户名'} />
      </FormItem>

      <FormItem
        label={'邮箱'}
        name={'email'}
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱' },
        ]}
      >
        <Input placeholder={'请输入邮箱'} type={'email'} />
      </FormItem>

      <FormItem
        label={'密码'}
        name={'password'}
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度至少为6位' },
          { max: 20, message: '密码长度最多为20位' },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: '密码只能包含数字、字母、下划线',
          },
        ]}
      >
        <Input placeholder={'请输入密码'} type={'password'} />
      </FormItem>

      <FormItem
        label={'确认密码'}
        name={'password2'}
        rules={[
          { required: true, message: '请输入密码', validateTrigger: 'onBlur' },
          {
            validator: async (rule, value) => {
              if (value !== form.getFieldValue('password')) {
                throw new Error('两次密码不一致');
              }
            },
            validateTrigger: 'onBlur',
          },
        ]}
      >
        <Input placeholder={'请再次输入密码'} type={'password'} />
      </FormItem>

      <Space>
        <FormItem label={'验证码'} name={'validateCode'} rules={[{ required: true, message: '请输入验证码' }]}>
          <Input placeholder={'请输入验证码, 区分大小写'} />
        </FormItem>

        <FormItem>
          <div
            className={'cursor-pointer user-modal-validate-code rounded-md overflow-hidden'}
            onClick={handleChangeValidateCode}
            style={{
              backgroundImage: `url(/api/image/validationCode?k=${randomKey})`,
            }}
          />
        </FormItem>
      </Space>

      <FormItem>
        <Space>
          <Button loading={loading} type={'primary'} onClick={handleSubmit}>
            注册
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              form.resetFields();
            }}
          >
            重置
          </Button>
        </Space>
      </FormItem>
    </Form>
  );
}
