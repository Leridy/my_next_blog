import {NextRequest, NextResponse} from "next/server";
import {User} from "@prisma/client";
import jwt from "jsonwebtoken";
import env from "../../../.project.json";
import {NextApiRequest} from "next";

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
      return NextResponse.redirect(req.nextUrl.origin); // 重定向到首页
    }
  }
}
