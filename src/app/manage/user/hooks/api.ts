import http from "@/http";
import {User} from "@prisma/client";

export const getUsers = (query: Partial<User>):Promise<Omit<User, 'password'>[]> => {
  return http.get("/user/all", {params: query});
};

export const getUser = (id: string) => {
  return http.get(`/user/${id}`);
};

export const createUser = (data: Pick<User, 'name' | 'email' | 'password'> & {
  password2: string,
  validationCode: string
}) => {
  return http.post("/user", data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return http.put(`/user/${id}`, data);
};

export const deleteUser = (id: string) => {
  return http.delete(`/user/${id}`);
};

