import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import {User} from '@prisma/client';
import useUserAuthData, {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";
import {message} from "antd";

interface UserContextType {
  user: Omit<User, 'password'> | null;
  setUser: (user: UserInfo | null) => void;
  requestLogout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children, initialState = null}: {
  children: ReactNode,
  initialState?: UserInfo | null
}) => {
  const [user, setUser] = useState<UserInfo | null>(initialState);
  const {requestLogout} = useUserAuthData();

  const handleUserLogout = useCallback(async () => {
    try {
      await requestLogout();
      setUser(null);``
    } catch (e) {
      message.error('登出失败');
    }


  }, [requestLogout]);

  return (
    <UserContext.Provider value={{user, setUser, requestLogout: handleUserLogout}}>
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
