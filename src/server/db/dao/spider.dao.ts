import { HotSpider as HS } from '@/server/db/models/spider';
import { HotSpider } from '@prisma/client';

class SpiderDao {
  public async get(query: Partial<Pick<HotSpider, 'name' | 'description' | 'updatedAt'>> | string) {
    // if a query is string, return HotSpider with that name
    // else return HotSpider fit the query.
    if (typeof query === 'string') {
      return HS.findUnique({
        where: {
          name: query,
        },
      });
    } else {
      return HS.findMany({
        where: {
          ...query,
          name: {
            contains: query.name,
            mode: 'insensitive',
          },
          description: {
            contains: query.description,
            mode: 'insensitive',
          },
          updatedAt: {
            gt: query.updatedAt,
          },
        },
        orderBy: {
          updatedAt: 'asc',
        },
      });
    }
  }

  public async create(query: Pick<HotSpider, 'name' | 'description'>) {
    return HS.create({
      data: query,
    });
  }

  public async update(id: number) {
    return HS.update({
      where: {
        id: id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }
}

const spiderDao = new SpiderDao();
export default spiderDao;
