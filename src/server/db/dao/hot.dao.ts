import {Hot} from '../models/hot';
import {HotTopic} from "@prisma/client";



export async function getHots(query: Partial<Omit<HotTopic, 'newsList'>>) {
  if (Object.keys(query).length === 1 && query.id) {
    return Hot.findUnique({
      where: {
        id: Number(query.id)
      }
    })
  }
  return Hot.findMany({
    where: {
      ...query,
      id: query.id ? Number(query.id) : undefined,
      name: {
        contains: query.name,
        mode: 'insensitive'
      },
      description: {
        contains: query.description,
        mode: 'insensitive'
      },
    },
    orderBy: {
      id: 'asc'
    }
  })
}

export async function createHot(data: Omit<HotTopic, 'id' | 'newsList'>) {
  return Hot.create({
    data
  });
}

export async function updateHot(id: string, data: Omit<HotTopic, 'id' | 'newsList'>) {
  return Hot.update({
    where: {
      id: Number(id)
    },
    data
  })
}

export async function deleteHot(id: string) {
  return Hot.delete({
    where: {
      id: Number(id)
    }
  })
}
