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

  // 获取访客总数
  getVisitorCount() {
    return V.count()
  }

  // 计算访问次数
  getVisitedCount(date?: Date) {
    if (date) {
      return V.aggregate({
        where: {
          updatedAt: {
            gte: date
          }
        },
        _sum: {
          visitedCount: true
        },
      })
    }

    return V.aggregate({
      _sum: {
        visitedCount: true
      }
    })
  }
}

const Visitor = new VisitorDao();
export default Visitor;
