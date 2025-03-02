import { NextRequest, NextResponse } from 'next/server';
import hotTopicStatisticDao from '@/server/db/dao/hotTopicStatistic.dao';
import { APIErrorHandler } from '@/utils/MyNRError';
import hotDao from '@/server/db/dao/hot.dao';
import { HotTopic } from '@prisma/client';

const put = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: [string] }> }
) => {
  // check whether newsId existed in the table
  const [id] = (await params).id;

  await hotTopicStatisticDao.createOrUpdate({
    topicId: Number(id),
  });

  return NextResponse.json(
    {
      message: 'ok',
    },
    { status: 200 }
  );
};

const get = async () => {
  // 清除过期的热门栏目统计数据
  await hotTopicStatisticDao.checkAndRemoveStatisticInfoNotToday();
  // 获取今日所有被统计栏目的点击次数
  const topicTodayVisitedInfo = await hotTopicStatisticDao.getAllClickCount();

  // 通过 topicId 获取栏目信息

  const result = await Promise.all(
    topicTodayVisitedInfo.map(async (topic) => {
      const { name } = (await hotDao.get({ id: topic.topicId })) as HotTopic;
      return {
        ...topic,
        name,
      };
    })
  );

  return NextResponse.json(
    {
      topicTodayVisitedInfo: result,
    },
    { status: 200 }
  );
};

export const PUT = (req: NextRequest, res: NextResponse) =>
  APIErrorHandler(req, res, put);
export const GET = (req: NextRequest, res: NextResponse) =>
  APIErrorHandler(req, res, get);
