import {vistor as V} from '../models/vistor';
import {visitor} from "@prisma/client";

class VisitorDao {
  async updateOrCreate(data: Pick<visitor, 'browserSign'>) {

    return V.upsert({
      where: {
        browserSign: data.browserSign
      },
      update: {
        visitedCount: {
          increment: 1
        }
      },
      create: {
        browserSign: data.browserSign,
        visitedCount: 1,
        ip: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
  }

  getTodayVisitorCount() {
    return V.count({
      where: {
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  }

  getNewVisitorCount() {
    return V.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  }

  // 获取访客总数
  getVisitorCount() {
    return V.count()
  }

  // 计算访问次数
  async getVisitedCount(date?: Date) {
    const where = date
      ? {updatedAt: {gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)}}
      : undefined;

    const result = await V.aggregate({
      where,
      _sum: {
        visitedCount: true
      }
    });

    return result._sum.visitedCount;

  }
}

const Visitor = new VisitorDao();
export default Visitor;
