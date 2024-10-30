// login
import http from "@/http";
import {RegisterData} from "../type";

export const login = async (data: { email: string, password: string }): Promise<{access_token: string}> => http.post('/user/login', data);

export const logout = async () => http.post('/user/logout');

export const register = async (data: RegisterData): Promise<{access_token: string}> => http.post('/user/register', data);

export const getUser = async (id: string) => http.get(`/user/${id}`);
