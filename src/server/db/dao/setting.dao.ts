import {Setting} from '../models/setting';
import {setting} from "@prisma/client";

export class SettingDao {
  public async get(query: Partial<setting> | null): Promise<setting[] | setting | null> {
    /**
     * there following rules to get setting
     * 1. if query is null, return all settings
     * 2. if query has id, return setting with that id
     * 3. if query has any other field, return setting with that field
     */
    if (!query) {
      return Setting.findMany();
    } else if (query.id) {
      return Setting.findUnique({
        where: {
          id: Number(query.id)
        }
      });
    } else {
      return Setting.findMany({
        where: {
          ...query,
          label: {
            contains: query.label
          },
          key: {
            contains: query.key
          },
          value: {
            contains: query.value
          },
        },
        orderBy: {
          id: 'asc'
        }
      });
    }
  }

  public async create(data: Omit<setting, 'id'>): Promise<setting> {
    return Setting.create({
      data
    });
  }

  public async update(id: string, data: Omit<setting, 'id'>): Promise<setting> {
    return Setting.update({
      where: {
        id: Number(id)
      },
      data: data
    });
  }

  public async del(id: string): Promise<setting> {
    return Setting.delete({
      where: {
        id: Number(id)
      }
    });
  }
}

export default new SettingDao();
