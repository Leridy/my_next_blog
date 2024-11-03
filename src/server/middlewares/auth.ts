import {NextRequest, NextResponse} from "next/server";
import {User} from "@prisma/client";
import jwt from "jsonwebtoken";
import {NextApiRequest} from "next";
import {MyNRError} from "@/utils/MyNRError";

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
    const token = req.cookies.get('token')?.value;

    let user: { exp: number, iat: number } & User | null = null
    // 从 token 中解析出用户信息
    try {
      if (!token) throw new MyNRError('No Token', 401);

      // 由于边缘计算不支持 crypto 模块，所以无法 verify token. 目前只能 decode token
      user = jwt.decode(token) as { exp: number, iat: number } & User;

      if (user.role < role) throw new MyNRError('没有权限，或者没有登录', 403);
      if (user.exp * 1000 < Date.now()) throw new MyNRError('token expired', 401);

    } catch (e) {
      // catch error is meanness, just for type check
      console.log(e);
      return NextResponse.redirect(req.nextUrl.origin); // 重定向到首页
    }
  }
}

export function getUserIdAndRoleToHeaders(req: NextRequest): Headers | NextResponse<unknown> {
  const token = req.cookies.get('token')?.value

  let user: { exp: number, iat: number } & User | null = null
  // 从 token 中解析出用户信息
  try {
    if (!token) throw new MyNRError('no token', 401);

    // 由于边缘计算不支持 crypto 模块，所以无法 verify token. 目前只能 decode token
    user = jwt.decode(token) as { exp: number, iat: number } & User;

    if (user.exp * 1000 < Date.now()) throw new MyNRError('token expired', 401);

    const newHeaders = new Headers(req.headers);

    newHeaders.set('x-user-id', user.id.toString());
    newHeaders.set('x-user-role', user.role);


    return newHeaders;

  } catch (e) {
    console.log(e);
    return NextResponse.redirect(req.nextUrl.origin); // 重定向到首页
  }
}
