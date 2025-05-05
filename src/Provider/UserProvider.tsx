import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { User } from '@prisma/client';
import useUserAuthData, { UserInfo } from '@/Components/UserComponents/hooks/useUserAuthData';
import { message } from 'antd';

interface UserContextType {
  user: Omit<User, 'password'> | null;
  requestLogout: () => Promise<void>;
  requestUserInfo: () => void;
  modalVisible: boolean;
  modalType: 'login' | 'register';
  showModal: (isLogin: boolean) => void;
  hideModal: () => void;
  handleModalSuccess: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode; initialState?: UserInfo | null }) => {
  const { requestLogout, requestUserInfo, user } = useUserAuthData();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'register'>('login');

  const showModal = useCallback((isLogin: boolean) => {
    setModalVisible(true);
    setModalType(isLogin ? 'login' : 'register');
  }, []);

  const hideModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleModalSuccess = useCallback(async () => {
    hideModal();
    await requestUserInfo();
  }, [hideModal, requestUserInfo]);

  const handleUserLogout = useCallback(async () => {
    try {
      await requestLogout();
    } catch (e) {
      console.error(e);
      message.error('登出失败');
    }
  }, [requestLogout]);

  useEffect(() => {
    if (!user) {
      requestUserInfo();
    }
  }, [requestUserInfo, user]);

  return (
    <UserContext.Provider
      value={{
        user,
        requestLogout: handleUserLogout,
        requestUserInfo,
        modalVisible,
        modalType,
        showModal,
        hideModal,
        handleModalSuccess,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
