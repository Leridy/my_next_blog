import {NextApiRequest, NextApiResponse} from "next";
import {MiddlewareHandler} from "./index";
import jwt from "jsonwebtoken";
import env from "../../../.project.json";
import {User} from "@prisma/client";
import validateCodeDao from "../db/dao/validateCode.dao";
const defaultValidateMethod = ['POST', 'PUT', 'DELETE'];

export enum Role {
  ADMIN = '2',
  USER = '1'
}

type AuthMiddlewareOptions = {
  validateMethod: NextApiRequest['method'][];
  role: Role;
}

export function validationAuthToken(handler: MiddlewareHandler, options: AuthMiddlewareOptions) {
  const {validateMethod = defaultValidateMethod, role} = options;
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // 鉴权, 从 header.authorization 或者 cookie 中获取 token
    if (validateMethod.includes(req.method)) {
      const token = req.cookies['token'] || req.headers['authorization'];
      console.log('token', token);

      let user: { exp: number, iat: number } & User | null = null
      // 从 token 中解析出用户信息
      try {
        if (!token) throw new Error('Unauthorized');

        user = jwt.verify(token, env.JWT_TOKEN_SECRET) as { exp: number, iat: number } & User;

        if (user.role < role) throw new Error('low permission');
        if (user.exp * 1000 < Date.now()) throw new Error('token expired');

      } catch (e) {
        res.setHeader('Set-Cookie', `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
        res.status(401).json({message: 'Unauthorized', e});
        return;
      }
    }

    return handler(req, res);
  }
}


export function checkValidationCode(handler: MiddlewareHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // 验证验证码
    const validateCode = req.body.validateCode;
    const sessionId = req.cookies.sessionId;
    if (!validateCode || !sessionId) {
      res.status(400).json({message: 'Validate Code is required'});
      return;
    }

    // 验证验证码是否正确
    const data = await validateCodeDao.getValidateCode({sessionId, validate: validateCode});
    if (!data) {
      res.status(400).json({message: 'Validate Code is incorrect'});
      return;
    } else {
      // remove the validate code
      await validateCodeDao.deleteValidateCode(String(data.id));
      res.setHeader('Set-Cookie', `sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
    }

    return handler(req, res);
  }
}
