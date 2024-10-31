// 日志中间件 记录请求的方法和路径
import {NextApiRequest, NextApiResponse} from "next";
import {MiddlewareHandler} from "@/server/middlewares";
import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";
import env from "../../../.project.json";
import {UserInfo} from "@/Components/UserComponents/hooks/useUserModalData";
import {Role} from "@/server/ApiUtils/auth";

type LogLevel = 'info' | 'warn' | 'error' | { method?: boolean, url?: boolean, headers?: boolean, payload?: boolean }

/**
 * 日志中间件
 * @param handler
 * @param level 日志级别
 */
export function logger(handler: MiddlewareHandler, level?: LogLevel) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // if you use an object as log level
    if (typeof level === 'object') {
      if (level.method) console.log('req.method', req.method)
      if (level.url) console.log('req.url', req.url)
      if (level.payload) console.log('payload', {body: req.body, query: req.query});
      if (level.headers) console.log('req.headers', req.headers);
    } else if (level === 'info') {
      // make method and url in one line
      console.log(req.url, req.method)
      console.log('payload', {body: req.body, query: req.query});
    } else if (level === 'warn') {
      console.warn(req.url, req.method)
      console.warn('payload', {body: req.body, query: req.query});
    } else if (level === 'error') {
      console.error(req.url, req.method)
      console.error('payload', {body: req.body, query: req.query});
      console.error('req.headers[authorization]', req.headers['authorization']);
    }
    return handler(req, res)
  }
}

export function checkTokenRole(req: NextRequest) {
  try {
    // getToken from cookie
    const token = req.cookies.get('token')?.value || '';
    // 对 token 进行 JWT 校验
    const result = jwt.verify(token, env.JWT_TOKEN_SECRET) as UserInfo;

    if (result.role >= Role.ADMIN) {
      NextResponse.next();
    } else {
      throw new Error('low permission');
    }
  } catch (e) {
    console.error(e);
    NextResponse.rewrite('/');
  }

}
