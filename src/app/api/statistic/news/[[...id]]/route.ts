import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import NewsStatisticsDao from "@/server/db/dao/newsStatistics.dao";
import NewsDao from "@/server/db/dao/news.dao";


async function put(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  // check whether newsId existed in the table
  const {id} = (await params);

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


  return NextResponse.json({
    message: 'ok'
  }, {status: 200});
}

async function get() {
  const topNews = await NewsStatisticsDao.getTop20List();

  const newsDetails = await Promise.all(topNews.map(async (news) => {
    const details = await NewsDao.get(news.newsId);
    const detail = Array.isArray(details) ? details.pop() : details;
    return {
      ...news,
      url: detail?.url,
      title: detail?.title,
    };
  }));

  return NextResponse.json(newsDetails, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
export const PUT = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, put);
