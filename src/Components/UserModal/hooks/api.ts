// login
import http from "@/http";
import {User} from "@prisma/client";

export const login = async (data: { email: string, password: string }): Promise<Omit<User, 'password'>> => http.post('/user/login', data);

export const logout = async () => http.post('/user/logout');

export const register = async (data: Pick<User, 'password' | 'email' | 'name'> & {
  password2: string,
  validateCode: string
}) => http.post('/user/register', data);

export const getUser = async (id: string) => http.get(`/user/${id}`);
