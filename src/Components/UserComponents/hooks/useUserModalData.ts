import {useState} from "react";
import {User} from "@prisma/client";
import {login, register, logout} from "./api";
import {RegisterData} from "../type";
import jwt from "jsonwebtoken";

export type UserInfo = Omit<User, 'password'>;

export default function useUserModalData() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLogin = async (data: Pick<User, 'email' | 'password'>) => {
    setLoading(true);
    try {
      const result = await login(data);
      const userData = jwt.decode(result.access_token) as typeof user;
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }

  }

  const requestLogout = async () => {
    // remove access token form cookie and local storage and reset user state
    setUser(null);
    return logout();
  }

  const requestRegister = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await register(data);
      const userData = jwt.decode(result.access_token) as typeof user;
      setUser(userData)
      return userData
    } finally {
      setLoading(false);
    }

  }

  return {
    user,
    loading,
    requestLogin,
    requestLogout,
    requestRegister,
  }

}
