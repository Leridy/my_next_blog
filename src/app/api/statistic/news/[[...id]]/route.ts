import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler, MyNRError } from '@/utils/MyNRError';
import NewsStatisticsDao from '@/server/db/dao/newsStatistics.dao';
import NewsDao from '@/server/db/dao/news.dao';

async function put(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // check whether newsId existed in the table
  const { id } = await params;

  const check = await NewsStatisticsDao.checkNewsId(id);

  // if not existed, insert it
  if (!check) {
    await NewsStatisticsDao.create({
      newsId: Number(id),
      clickCount: 1,
    });
  } else {
    // if existed, update clickCount
    await NewsStatisticsDao.update({
      newsId: Number(id),
      clickCount: check.clickCount + 1,
    });
  }

  return NextResponse.json(
    {
      message: 'ok',
    },
    { status: 200 }
  );
}

async function get(
  req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const [id] = (await params).id;

  if (id === 'top20News') {
    const topNews = await NewsStatisticsDao.getTop20List();
    const newsDetails = await Promise.all(
      topNews.map(async (news) => {
        const details = await NewsDao.get(news.newsId);
        const detail = Array.isArray(details) ? details.pop() : details;
        return {
          ...news,
          url: detail?.url,
          title: detail?.title,
        };
      })
    );
    return NextResponse.json(newsDetails, { status: 200 });
  } else if (id === 'todayClickedNewsCount') {
    const todayClickedNewsCount = await NewsStatisticsDao.getTodayNewsCount();
    return NextResponse.json(
      {
        todayClickedNewsCount,
      },
      { status: 200 }
    );
  } else if (id === 'count') {
    const todayNewsCount = await NewsDao.getTodayCount();
    const allNewsCount = await NewsDao.getAllCount();
    return NextResponse.json(
      {
        todayNewsCount,
        allNewsCount,
      },
      { status: 200 }
    );
  } else if (id === 'visitor') {
    const todayClickCount = await NewsStatisticsDao.getClickCount(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const allClickCount = await NewsStatisticsDao.getClickCount();
    return NextResponse.json(
      {
        todayClickCount,
        allClickCount,
      },
      { status: 200 }
    );
  } else {
    return new MyNRError('Not implemented', 501);
  }
}

export const GET = (req: NextRequest, res: NextResponse) =>
  APIErrorHandler(req, res, get);
export const PUT = (req: NextRequest, res: NextResponse) =>
  APIErrorHandler(req, res, put);
