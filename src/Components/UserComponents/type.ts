import {User} from "@prisma/client";

export interface RegisterData extends Pick<User, 'name' | 'email' | 'password'> {
  password2: string;
  validateCode: string;
}
