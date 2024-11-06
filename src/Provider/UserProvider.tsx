import React, {createContext, useContext, ReactNode, useCallback, useEffect} from 'react';
import {User} from '@prisma/client';
import useUserAuthData, {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";
import {message} from "antd";

interface UserContextType {
  user: Omit<User, 'password'> | null;
  requestLogout: () => void;
  requestUserInfo: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {
  children: ReactNode,
  initialState?: UserInfo | null
}) => {
  const {requestLogout, requestUserInfo, user} = useUserAuthData();

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
    <UserContext.Provider value={{user, requestLogout: handleUserLogout, requestUserInfo}}>
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
