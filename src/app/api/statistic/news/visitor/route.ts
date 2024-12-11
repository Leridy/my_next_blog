import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import NewsStatisticsDao from "@/server/db/dao/newsStatistics.dao";

async function get() {
  const todayClickCount = await NewsStatisticsDao.getClickCount(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const allClickCount = await NewsStatisticsDao.getClickCount();

  return NextResponse.json({
    todayClickCount,
    allClickCount,
  }, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
