import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler } from '@/utils/MyNRError';
import Spider from '@/server/Spider';

/**
 * handle GET /api/spider route
 * @description 因为 Spider 的注册是由代码自动完成的，所以不需要提供创建、更新、删除的接口，这里只需要提供列表和详情接口
 */
async function get(req: NextRequest) {
  const { headers } = req;
  const noCache = headers.get('x-no-cache') === 'true';
  const originQuery = Object.fromEntries(req.nextUrl.searchParams.entries());

  const { name } = originQuery;

  const spiderNames = name ? [name] : [];

  const result = await Spider({ spiderNames });

  return NextResponse.json(result, {
    status: 200,
    headers: noCache
      ? {}
      : {
          'Cache-Control': 'public, max-age=1800',
          'last-modified': new Date().toUTCString(),
        },
  });
}

export const GET = (req: NextRequest, res: NextResponse) =>
  APIErrorHandler(req, res, get);
