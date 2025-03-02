import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler } from '@/utils/MyNRError';
import VisitorDao from '@/server/db/dao/visitor.dao';

async function get() {
  // 获取今日访问次数
  const todayVisitorRank = await VisitorDao.getTodayVisitorRank();

  return NextResponse.json(
    todayVisitorRank,

    { status: 200 }
  );
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
