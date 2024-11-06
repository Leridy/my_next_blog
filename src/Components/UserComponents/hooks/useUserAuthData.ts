import {useCallback, useState} from "react";
import {User} from "@prisma/client";
import {login, register, logout, getUserByToken} from "./api";
import {RegisterData} from "../type";
import * as jose from 'jose';

export type UserInfo = Omit<User, 'password'>;

export default function useUserAuthData() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * send a request to get user info, using token in cookie, checking user's status
   * @returns user info
   */
  const requestUserInfo = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserByToken()
      setUser(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLogin = async (data: Pick<User, 'email' | 'password'>) => {
    setLoading(true);
    try {
      const result = await login(data);
      const userData = jose.decodeJwt<UserInfo>(result.access_token)
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }

  }

  const requestLogout = async () => {
    // remove access token form cookie and local storage and reset user state
    await logout();
    setUser(null);
  }

  const requestRegister = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await register(data);
      const userData = jose.decodeJwt<UserInfo>(result.access_token);
      setUser(userData)
      return userData
    } finally {
      setLoading(false);
    }

  }, [])

  return {
    user,
    loading,
    requestLogin,
    requestLogout,
    requestRegister,
    requestUserInfo,
  }

}
