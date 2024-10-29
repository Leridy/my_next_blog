// 使用 PBKDF2 算法对密码进行哈希
import CryptoJS from "crypto-js";
import {NextApiRequest, NextApiResponse} from "next";
import env from "../../../.project.json";
import type {MiddlewareHandler} from "@/server/middlewares";

export function hashPassword(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations: 1000,
  }).toString();
}

export function encryptWithSalt(handler: MiddlewareHandler): MiddlewareHandler {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    if (req.body.password) req.body.password = hashPassword(req.body.password, env.USER_PASSWORD_SALT);
    if (req.body.password2) req.body.password2 = hashPassword(req.body.password2, env.USER_PASSWORD_SALT);
    // 加密
    return handler(req, res);
  }
}
