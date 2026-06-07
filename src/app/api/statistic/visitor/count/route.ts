import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler } from '@/utils/MyNRError';
import VisitorDao from '@/server/db/dao/visitor.dao';

async function get() {
  // 获取今日访客数
  const todayVisitorCount = await VisitorDao.getTodayVisitorCount();
  // 获取总访客数
  const totalVisitorCount = await VisitorDao.getVisitorCount();
  // 获取新访客数
  const newVisitorCount = await VisitorDao.getNewVisitorCount();

  return NextResponse.json(
    {
      todayVisitorCount,
      totalVisitorCount,
      newVisitorCount,
    },
    { status: 200 }
  );
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
