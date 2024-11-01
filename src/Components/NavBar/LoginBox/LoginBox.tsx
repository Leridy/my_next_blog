import {useState} from "react";
import {Button, Space} from "antd";
import UserModal from "@/Components/UserComponents/UserModal";
import {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";
import {useUserContext} from "@/Provider/UserProvider";

export default function LoginBox() {
  const {setUser} = useUserContext();

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'login' | 'register'>('login');

  const showModal = (isLogin: boolean) => {
    setVisible(true);
    setType(isLogin ? 'login' : 'register');
  }

  const handleSuccess = (user: UserInfo | null) => {
    setVisible(false);
    setUser(user);
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
