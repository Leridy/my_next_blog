// src/app/api/link/redirect/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler, MyNRError } from '@/utils/MyNRError';
import NewsDao from '@/server/db/dao/news.dao';
import NewsStatisticsDao from '@/server/db/dao/newsStatistics.dao';

/**
 * 处理新闻链接重定向并统计点击次数
 * GET /api/link/redirect/{id}
 */
async function get(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    throw new MyNRError('缺少新闻ID', 400);
  }

  // 从数据库查询新闻信息
  const news = await NewsDao.get(Number(id));

  if (!news) {
    throw new MyNRError('新闻不存在', 404, { id });
  }

  // 确保我们有一个单一的新闻对象
  const newsItem = Array.isArray(news) ? news[0] : news;

  if (!newsItem?.url) {
    throw new MyNRError('新闻链接无效', 400, { id });
  }

  // 检查新闻是否已有统计记录
  const check = await NewsStatisticsDao.checkNewsId(id);

  // 更新或创建统计记录
  if (!check) {
    await NewsStatisticsDao.create({
      newsId: Number(id),
      clickCount: 1,
    });
  } else {
    await NewsStatisticsDao.update({
      newsId: Number(id),
      clickCount: check.clickCount + 1,
    });
  }

  // 重定向到目标URL
  return NextResponse.redirect(newsItem.url);
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
