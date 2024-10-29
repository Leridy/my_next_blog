import {Button, Form, Input, Space} from "antd";
import {User} from "@prisma/client";
import FormItem from "antd/es/form/FormItem";
import {useState} from "react";
import './UserModal.style.scss';

interface RegisterFormProps {
  onRegister: (data: Partial<User>) => void;
}

export default function RegisterForm(props: RegisterFormProps) {
  const {onRegister} = props;
  const [form] = Form.useForm<Partial<User>>();
  const [randomKey, setRandomKey] = useState(Math.random());

  const handleChangeValidateCode = () => {
    setRandomKey(prevState => prevState + 1);
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onRegister(values);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Form
      form={form}
      layout={'vertical'}
    >
      <FormItem
        label={"用户名"}
        name={"name"}
        rules={[
          {required: true, message: '请输入用户名'}
        ]}
      >
        <Input
          placeholder={"请输入用户名"}
        />
      </FormItem>

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
          {required: true, message: '请输入密码'},
          {min: 6, message: '密码长度至少为6位'},
          {max: 20, message: '密码长度最多为20位'},
          {pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能包含数字、字母、下划线'}
        ]}
      >
        <Input
          placeholder={"请输入密码"}
          type={"password"}
        />
      </FormItem>

      <FormItem
        label={"确认密码"}
        name={"password2"}
        rules={[
          {required: true, message: '请输入密码', validateTrigger: 'onBlur'},
          {
            validator: async (rule, value) => {
              if (value !== form.getFieldValue('password')) {
                throw new Error('两次密码不一致');
              }
            }, validateTrigger: 'onBlur'
          }
        ]}
      >
        <Input
          placeholder={"请再次输入密码"}
          type={"password"}
        />
      </FormItem>

      <Space>
        <FormItem
          label={"验证码"}
          name={"code"}
          rules={[
            {required: true, message: '请输入验证码'}
          ]}
        >
          <Input
            placeholder={"请输入验证码, 区分大小写"}
          />
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
          <Button type={"primary"} onClick={handleSubmit}>注册</Button>
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >重置</Button>
        </Space>
      </FormItem>


    </Form>
  )

}
