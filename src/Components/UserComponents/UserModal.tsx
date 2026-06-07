import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthForm from './AuthForm';
import useUserAuthData, { UserInfo } from './hooks/useUserAuthData';
import { User } from '@prisma/client';
import { RegisterData } from './type';
import './UserModal.style.scss';
import { CloseCircleFilled } from '@ant-design/icons';

interface UserModalProps {
  visible: boolean;
  defaultType?: 'login' | 'register';
  onClose: () => void;
  onLogin: (user: UserInfo | null) => void;
  onRegister?: (user: UserInfo | null) => void;
}

export default function UserModal(props: UserModalProps) {
  const { visible, onClose, onLogin, onRegister, defaultType } = props;
  const { loading, requestRegister, requestLogin } = useUserAuthData();
  const [type, setType] = useState<'login' | 'register'>(defaultType || 'login');

  const handleLogin = async (data: Pick<User, 'email' | 'password'> & { validateCode: string }) => {
    try {
      const result = await requestLogin(data);
      onLogin(result);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const user = await requestRegister(data);
      onRegister?.(user);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      className="user-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: visible ? 'flex' : 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="user-modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: visible ? 1 : 0.9, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="user-modal-header">
          <h2 className={'font-bold'}>{type === 'login' ? '登录' : '注册'}</h2>
          <button
            className="user-modal-close"
            onClick={onClose}
          >
            <CloseCircleFilled />
          </button>
        </div>

        <AuthForm
          type={type}
          onSubmit={type === 'login' ? handleLogin : handleRegister}
          loading={loading}
        />

        {onRegister && (
          <motion.p
            className="toggle-auth-type"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {type === 'login' ? '没有账户？' : '已有账户？'}
            <button onClick={() => setType(type === 'login' ? 'register' : 'login')}>{type === 'login' ? '点击注册' : '点击登录'}</button>
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
