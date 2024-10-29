import {useState} from "react";
import {User} from "@prisma/client";
import {login, register} from "@/Components/UserModal/hooks/api";

export default function useUserModalData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const requestLogin = async (data: Pick<User, 'email' | 'password'>) => {
    setLoading(true);
    try {
      const result = await login(data);
      setUser(result);
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      setLoading(false);
    }

  }

  const requestLogout = () => {
    console.log('logout');
  }

  const requestRegister = async (data: Pick<User, 'name' | 'email' | 'password'> & {
    password2: string,
    validateCode: string
  }) => {
    setLoading(true);
    try {
      await register(data);
    } catch (e) {
      throw e;
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
