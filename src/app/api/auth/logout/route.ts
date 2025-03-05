import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler } from '@/utils/MyNRError';

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

/**
 * logout should do the following:
 * 1. request to server remove the token in the cookie
 */
async function post(req: NextRequest) {
  // 获取主域名
  const mainDomain = getMainDomain(req);

  // 确定是否需要添加域名设置
  const domainSetting = mainDomain !== 'localhost' && mainDomain !== '127.0.0.1' ? `Domain=.${mainDomain}; ` : '';

  // 将 SameSite 设置为 Lax 以匹配登录时的设置
  // 设置过期的Cookie (设置过期时间为过去)
  const cookieString = `token=; ${domainSetting}Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;

  // remove the token in the cookie
  return NextResponse.json(
    { message: 'logout success' },
    {
      status: 200,
      headers: {
        'Set-Cookie': cookieString,
      },
    }
  );
}

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
