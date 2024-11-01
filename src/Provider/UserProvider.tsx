import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@prisma/client';
import {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";

interface UserContextType {
  user: Omit<User, 'password'> | null;
  setUser: (user: UserInfo | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children , initialState = null }: { children: ReactNode, initialState?: UserInfo | null}) => {
  const [user, setUser] = useState<UserInfo | null>(initialState);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
