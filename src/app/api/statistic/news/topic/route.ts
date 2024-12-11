import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import NewsStatisticsDao from "@/server/db/dao/newsStatistics.dao";

async function get() {
  const todayClickedNewsCount = await NewsStatisticsDao.getTodayNewsCount();

  return NextResponse.json({
    todayClickedNewsCount
  }, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
