// Note: Middleware for the server

import {NextApiRequest, NextApiResponse} from "next";
import CryptoJS from 'crypto-js';
import env from '../../.project.json'

export type MiddlewareHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// 鉴权中间件 判断指定接口的请求是否携带有效的 token，以及 指定的 数据是否符合要求
export function validationAuthToken(handler: MiddlewareHandler, validateMethod: typeof NextApiRequest['method'][] = ['GET', 'POST', 'PUT', 'DELETE']) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // 鉴权
    if (validateMethod.includes(req.method)) {
      const token = req.headers['authorization'];
      if (!token) {
        res.status(401).json({message: 'Unauthorized'})
        return;
      }

      // 验证 token 数据是否合法
      // const isValid = await verifyToken(token);
    }



    return handler(req, res)
  }
}


// 日志中间件 记录请求的方法和路径
export function logger(handler: MiddlewareHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    console.log('req.method', req.method)
    console.log('req.url', req.url)
    console.log('payload', {body: req.body, query: req.query})
    return handler(req, res)
  }
}


// 使用 PBKDF2 算法对密码进行哈希
function hashPassword(password: string, salt: string): string {
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
    return handler(req, res)
  }
}
