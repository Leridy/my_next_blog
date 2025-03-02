import { HotNewsStatistics as HNS } from '../models/newsStatistics';
import { HotNewsStatistics } from '@prisma/client';

class NewsStatistics {
  // check newsId existed in the table
  public async checkNewsId(newsId: string): Promise<HotNewsStatistics | null> {
    return HNS.findUnique({
      where: {
        newsId: Number(newsId),
      },
    });
  }

  public async get(query: Partial<Partial<HotNewsStatistics>>) {
    return HNS.findMany({
      where: {
        ...query,
      },
      orderBy: {
        clickCount: 'asc',
      },
    });
  }

  public async getTop20List(): Promise<
    Pick<HotNewsStatistics, 'id' | 'newsId' | 'clickCount'>[]
  > {
    return HNS.findMany({
      where: {
        updatedAt: {
          // get data in 24 hours
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        clickCount: 'desc',
      },
      take: 20,
      select: {
        id: true,
        newsId: true,
        clickCount: true,
      },
    });
  }

  public async getClickCount(date?: Date): Promise<number> {
    const where = date
      ? {
          updatedAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        }
      : undefined;
    const result = await HNS.aggregate({ where, _sum: { clickCount: true } });
    return result._sum.clickCount;
  }

  public async getTodayNewsCount(): Promise<number> {
    const where = {
      updatedAt: {
        gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    };
    const result = await HNS.aggregate({ where, _count: { id: true } });
    return result._count.id;
  }

  public async create(
    data: Omit<HotNewsStatistics, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    return HNS.create({
      data,
    });
  }

  public async update(
    data: Omit<HotNewsStatistics, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const { newsId, ...rest } = data;
    return HNS.update({
      where: {
        newsId: Number(newsId),
      },
      data: {
        ...rest,
      },
    });
  }

  public async del(id: string) {
    return HNS.delete({
      where: {
        id: Number(id),
      },
    });
  }
}

const newsStatistics = new NewsStatistics();
export default newsStatistics;
