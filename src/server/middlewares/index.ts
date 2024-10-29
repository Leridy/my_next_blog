// Note: Middleware for the server
import type {NextApiRequest, NextApiResponse} from "next";

export type MiddlewareHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// 鉴权中间件 判断指定接口的请求是否携带有效的 token，以及 指定的 数据是否符合要求


export * from './auth';
export * from './utils';
export * from './encryption';
