import {NextApiRequest} from "next";
import jwt from "jsonwebtoken";
import env from "../../../.project.json";
import {User} from "@prisma/client";
import validateCodeDao from "@/server/db/dao/validateCode.dao";
import {NextRequest, NextResponse} from "next/server";



const defaultValidateMethod = ['POST', 'PUT', 'DELETE'];

export enum Role {
  ADMIN = '2',
  USER = '1'
}

/**
 * to make response operation in api functions,
 * so I need to avoid use functions on a req object.
 * I name SetHeaderOperation as the following functions results,
 * so the api function could combine the all header operation done in one place.
 */
export type SetHeaderOperation = Record<string, string[] | string>

type AuthMiddlewareOptions = {
  validateMethod: NextApiRequest['method'][];
  role: Role;
}


export function validationAuthToken(req: NextRequest, options: AuthMiddlewareOptions) {
  const {validateMethod = defaultValidateMethod, role} = options;
  // 鉴权, 从 header.authorization 或者 cookie 中获取 token
  if (validateMethod.includes(req.method)) {
    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split('Bearer ')[1];

    let user: { exp: number, iat: number } & User | null = null
    // 从 token 中解析出用户信息
    try {
      if (!token) throw new Error('Unauthorized');

      user = jwt.verify(token, env.JWT_TOKEN_SECRET) as { exp: number, iat: number } & User;

      if (user.role < role) throw new Error('low permission');
      if (user.exp * 1000 < Date.now()) throw new Error('token expired');

      return NextResponse.next();
    } catch (e) {
      console.log(e);
      return NextResponse.rewrite('/'); // 重定向到首页
    }
  }
}

export async function checkValidationCode(req: NextRequest):Promise<SetHeaderOperation | undefined> {
  // 验证验证码
  const validateCode = req.body.validateCode;
  const sessionId = req.cookies.sessionId;
  if (!validateCode || !sessionId) {
    throw new Error('Validate Code is required');
  }

  // 验证验证码是否正确
  const data = await validateCodeDao.getValidateCode({sessionId, validate: validateCode});

  if (!data) {
    throw new Error('Validate Code is incorrect');
  } else {
    // remove the validate code
    await validateCodeDao.deleteValidateCode(String(data.id));
    // res.setHeader('Set-Cookie', `sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
    return {
      'Set-Cookie': 'sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;'
    }
  }
}


