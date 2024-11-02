import {Button, Form, Input, message, Space} from "antd";
import FormItem from "antd/es/form/FormItem";
import {User} from "@prisma/client";
import {useState} from "react";
import './UserModal.style.scss';

interface LoginFormProps {
  onLogin: (data: Pick<User, 'email' | 'password'> & { validateCode: string }) => void;
  loading?: boolean;
}

export default function LoginForm(props: LoginFormProps) {
  const {onLogin, loading} = props;
  const [form] = Form.useForm<Pick<User, 'email' | 'password'> & { validateCode: string }>();
  const [randomKey, setRandomKey] = useState(Math.random());

  const handleChangeValidateCode = () => {
    setRandomKey((prevState) => prevState + 1);
  }

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      onLogin(values);
    } catch (e) {
      console.error(e);
      message.error(`请检查输入的内容`);
    }
  }

  return (
    <Form
      form={form}
      layout={'vertical'}
    >
      <FormItem
        label={"邮箱"}
        name={"email"}
        rules={[
          {required: true, message: '请输入邮箱'},
          {type: 'email', message: '请输入正确的邮箱'}

        ]}
      >
        <Input
          placeholder={"请输入邮箱"}
          type={"email"}
        />
      </FormItem>

      <FormItem
        label={"密码"}
        name={"password"}
        rules={[
          {required: true, message: '请输入密码'}
        ]}
      >
        <Input
          placeholder={"请输入密码"}
          type={"password"}
        />
      </FormItem>

      <Space>

        <FormItem
          label={"验证码"}
          name={"validateCode"}
          rules={[
            {required: true, message: '请输入验证码'}
          ]}
        >
          <Input
            placeholder={"请输入验证码, 区分大小写"}
          />
        </FormItem>

        <FormItem
          label={" "}
        >
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
          <Button
            type={"primary"}
            onClick={handleLogin}
            loading={loading}
          >登录</Button>

          <Button
            loading={loading}
            onClick={() => {
              form.resetFields();
            }}
          >重置</Button>
        </Space>
      </FormItem>
    </Form>
  )
}
