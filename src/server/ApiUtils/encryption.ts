// 使用 PBKDF2 算法对密码进行哈希
import CryptoJS from 'crypto-js';
import { NextRequest } from 'next/server';
import { readableStreamToJSON } from '@/utils/readableStreamToJSON';

export function hashPassword(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations: 1000,
  }).toString();
}

export async function encryptPwdWithSalt(req: NextRequest) {
  // update the password with the hashed password in req.body
  const data = (await readableStreamToJSON(req.body)) as Record<string, string>;
  const salt = process.env.USER_PASSWORD_SALT || '';

  if (data.password) data.password = hashPassword(data.password, salt);
  if (data.password2) data.password2 = hashPassword(data.password2, salt);

  return {
    ...data,
  };
}
