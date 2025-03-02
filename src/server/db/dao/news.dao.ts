import { HotNews } from '@prisma/client';
import { HotNews as HN } from '../models/news';
import { OrderBy, PageDataBaseQuery } from '@/server/db/dao/type';

class NewsDao {
  public async get(
    query: Partial<Omit<HotNews, 'tags'>> | number,
    page?: PageDataBaseQuery,
    orderByRule?: OrderBy
  ) {
    if (typeof query === 'number') {
      return HN.findUnique({
        where: {
          id: query,
        },
      });
    }
    return HN.findMany({
      // if page is not provided, return all data
      // else return data with pagination
      ...page,
      where: {
        ...query,
        title: {
          contains: query.title,
          mode: 'insensitive',
        },
        description: {
          contains: query.description,
          mode: 'insensitive',
        },
        uniqueId: query.uniqueId,
        updatedAt: {
          gte: query.updatedAt,
        },
      },
      orderBy: {
        ...orderByRule,
      },
    });
  }

  public async getTotalCount(query: Partial<Omit<HotNews, 'tags'>>) {
    return HN.count({
      where: {
        ...query,
        title: {
          contains: query.title,
          mode: 'insensitive',
        },
        description: {
          contains: query.description,
          mode: 'insensitive',
        },
        uniqueId: query.uniqueId,
        updatedAt: {
          gte: query.updatedAt,
        },
      },
    });
  }

  // get All data count
  public async getAllCount() {
    return HN.count();
  }

  // get data count today
  public async getTodayCount() {
    return HN.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  public async create(
    query: Pick<HotNews, 'title' | 'description' | 'url' | 'uniqueId'>
  ) {
    return HN.create({
      data: query,
    });
  }

  public async update(
    id: number,
    data: Pick<HotNews, 'title' | 'description' | 'url'>
  ) {
    return HN.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
    });
  }

  public async delete(query: Pick<HotNews, 'id'>) {
    return HN.delete({
      where: {
        id: query.id,
      },
    });
  }
}

const newsDao = new NewsDao();
export default newsDao;
