// login
import http from "@/http";
import {RegisterData} from "../type";
import {UserInfo} from "@/Components/UserComponents/hooks/useUserAuthData";

export const login = async (data: { email: string, password: string }): Promise<{
  access_token: string
}> => http.post('/auth/login', data);

export const logout = async () => http.post('/auth/logout');

export const register = async (data: RegisterData): Promise<UserInfo> => http.post('/auth/register', data);

export const getUser = async (id: string) => http.get(`/user/${id}`);

export const getUserByToken = async (): Promise<UserInfo> => http.get('/user', {headers: {'x-ignore-error': 'true'}});
