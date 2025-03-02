import { vistor as V } from '../models/vistor';
import { visitor } from '@prisma/client';

class VisitorDao {
  async updateOrCreate(data: Pick<visitor, 'browserSign' | 'ip'>) {
    // 获取当前访客信息
    const visitor = await V.findUnique({
      where: {
        browserSign: data.browserSign,
      },
      select: {
        updatedAt: true,
        todayCount: true,
      },
    });

    // 判断是否是今天的访问
    const today = new Date();
    const isToday =
      visitor &&
      new Date(visitor.updatedAt).toDateString() === today.toDateString();
    const newTodayCount = isToday ? visitor.todayCount + 1 : 1;

    // 更新或创建访客记录
    return V.upsert({
      where: {
        browserSign: data.browserSign,
      },
      update: {
        visitedCount: {
          increment: 1,
        },
        todayCount: newTodayCount,
        ip: data.ip,
        updatedAt: today,
      },
      create: {
        browserSign: data.browserSign,
        visitedCount: 1,
        todayCount: 1,
        ip: data.ip,
        createdAt: today,
        updatedAt: today,
      },
    });
  }

  getTodayVisitorCount() {
    return V.count({
      where: {
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
  }

  getNewVisitorCount() {
    return V.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
  }

  // 获取访客总数
  getVisitorCount() {
    return V.count();
  }

  // 计算总的访问次数 或 指定日期后的总访问次数
  async getVisitedCount(date?: Date) {
    const where = date
      ? {
          updatedAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        }
      : undefined;

    const result = await V.aggregate({
      where,
      _sum: {
        visitedCount: true,
      },
    });

    return result._sum.visitedCount;
  }

  // 获取当天的访问次数
  async getTodayVisitedCount() {
    const result = await V.aggregate({
      where: {
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: {
        todayCount: true,
      },
    });

    return result._sum.todayCount;
  }

  // 获取今日访客列表的前 20 条，并以 todayCount 降序排序
  getTodayVisitorRank() {
    return V.findMany({
      where: {
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: {
        todayCount: 'desc',
      },
      take: 20,
    });
  }
}

const Visitor = new VisitorDao();
export default Visitor;
