import { NextRequest, NextResponse } from 'next/server';
import { User } from '@prisma/client';
import * as Yup from 'yup';
import * as jose from 'jose';
import userDao from '@/server/db/dao/user.dao';
import { checkValidationCode } from '@/server/ApiUtils/auth';
import { SetHeaderOperation } from '@/server/middlewares';
import { encryptPwdWithSalt } from '@/server/ApiUtils/encryption';
import { mergeHeaderObj } from '@/utils/mergeObject';
import { APIErrorHandler, MyNRError } from '@/utils/MyNRError';

const login = async (data: Pick<User, 'email' | 'password'>) => {
  return userDao.login(data);
};

const updateLastLoginData = async (data: Pick<User, 'id'>) => {
  return userDao.updateLastLoginData(data);
};

/**
 * 获取主域名（去掉子域名部分）
 */
function getMainDomain(req: NextRequest): string {
  const host = req.headers.get('host') || '';
  // 分离域名部分
  const hostname = host.split(':')[0]; // 移除可能的端口号

  // 检查是否为本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return hostname;
  }

  // 解析主域名（取最后两部分）
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return hostname; // 兜底情况
}

async function post(req: NextRequest) {
  // the refactor logic code above into this function you should remember the req is a NextRequest object,
  // and you should return a NextResponse object.

  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    validateCode: Yup.string().required(),
  });

  const data = (await encryptPwdWithSalt(req)) as Pick<User, 'email' | 'password'> & { validateCode: string };

  const sessionId = req.cookies.get('sessionId')?.value || '';
  await schema.validate(data);
  const validateResult = await checkValidationCode(data.validateCode, sessionId);
  const result = await login(data);
  if (!result) throw new MyNRError('用户不存在或密码错误', 401);

  const returnResult = { ...result } as Partial<User>;
  delete returnResult.password;

  const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET || '');
  const alg = 'HS256';

  const token = await new jose.SignJWT(returnResult).setProtectedHeader({ alg }).setIssuedAt().setExpirationTime('30d').sign(secret);

  // 获取主域名
  const mainDomain = getMainDomain(req);

  // 确定是否需要添加域名设置
  const domainSetting = mainDomain !== 'localhost' && mainDomain !== '127.0.0.1' ? `Domain=.${mainDomain}; ` : '';

  // 设置更宽松的 SameSite 策略以支持子域名交互，如需安全性更强可以用 Lax 替代 None
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  resHeaderOperation['Set-Cookie'] = `token=${token}; ${domainSetting}Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=${30 * 24 * 60 * 60};`;

  if (validateResult) {
    resHeaderOperation = mergeHeaderObj(resHeaderOperation, validateResult);
  }

  updateLastLoginData({ id: result.id });

  return NextResponse.json(
    { access_token: token },
    {
      status: 200,
      headers: resHeaderOperation as Record<string, string>,
    }
  );
}

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
