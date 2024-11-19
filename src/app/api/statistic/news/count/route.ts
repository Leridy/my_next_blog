import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import NewsDao from "@/server/db/dao/news.dao";

async function get() {
  const todayNewsCount = await NewsDao.getTodayCount();
  const allNewsCount = await NewsDao.getAllCount();

  return NextResponse.json({
    todayNewsCount,
    allNewsCount,
  }, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
