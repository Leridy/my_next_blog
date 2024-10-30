import {Button, Modal} from "antd";
import {useState} from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import useUserModalData, {UserInfo} from "./hooks/useUserModalData";
import {User} from "@prisma/client";
import {RegisterData} from "./type";

/**
 * UserModal component·
 * @constructor
 * @description 这个弹窗主要用于用户的登录和注册
 */
interface UserModalProps {
  visible: boolean;
  defaultType?: 'login' | 'register';
  onClose: () => void;
  onLogin: (user: UserInfo | null) => void;
  onRegister?: (user: UserInfo | null) => void;
}

export default function UserModal(props: UserModalProps) {
  const {visible, onClose, onLogin, onRegister, defaultType} = props;

  const {loading, requestRegister, requestLogin} = useUserModalData();

  const [type, setType] = useState<'login' | 'register'>(defaultType || 'login');

  const handleLogin = async (data: Pick<User, 'email' | 'password'> & { validateCode: string }) => {
    try {
      const result = await requestLogin(data);
      onLogin(result);
      onClose();
    } catch (e) {
      console.log(e);
      alert('Login ')
    }
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      const user = await requestRegister(data);
      onRegister?.(user);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Register failed, more details check in console');
    }
  }

  return (
    <Modal
      title={type === 'login' ? '登录' : '注册'}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {
        type === 'login' ? <LoginForm loading={loading} onLogin={handleLogin}/> :
          <RegisterForm loading={loading} onRegister={handleRegister}/>
      }
      {/* 已有账户？点击登录 */}
      {
        onRegister && (
          <p
            className={'text-center cursor-pointer'}>
            {type === 'login' ? '没有账户？' : '已有账户？'}
            <Button
              type={'link'}
              size={'small'}
              onClick={() => setType(type === 'login' ? 'register' : 'login')}
            >
              {type === 'login' ? '点击注册' : '点击登录'}
            </Button>
          </p>
        )
      }
    </Modal>
  )

}
