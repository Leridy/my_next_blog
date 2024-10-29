import {Button, Space} from "antd";
import type {ButtonProps} from "antd";
import UserModal from "@/Components/UserModal/UserModal";
import {useState} from "react";

type LoginBoxProps = ButtonProps

export default function LoginBox(props: LoginBoxProps) {
  const {onClick} = props;

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'login' | 'register'>('login');

  const showModal = (isLogin: boolean) => {
    setVisible(true);
    setType(isLogin ? 'login' : 'register');
  }

  const handleSuccess = () => {
    setVisible(false);
  }

  const handleCancel = () => {
    setVisible(false);
  }

  return (
    <Space
      direction="horizontal"
    >
      <Button
        type="primary"
        onClick={() => showModal(true)}
      >登录</Button>
      <Button
        type={'default'}
        onClick={() => showModal(false)}
      >注册</Button>
      {
        visible && (
          <UserModal
            visible={visible}
            onClose={handleCancel}
            onLogin={handleSuccess}
            onRegister={handleSuccess}
            defaultType={type}
          />
        )
      }
    </Space>
  )
}
