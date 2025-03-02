import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';

interface HupuDataStructure {
  tid: number;
  title: string;
  type: string;
  username: string;
  replies: number;
  recommendNum: number;
  time: 'string';
  url: string;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'hupu',
  description: 'hupu 爬虫',
};

const URL_GENERATOR = (type: string | number) => `https://m.hupu.com/api/v2/bbs/topicThreads?topicId=${type}&page=1`;

const ListType = {
  主干道: 1,
  恋爱区: 6,
  // "校园区" : 11,
  // "历史区" : 12,
  // "摄影区" : 612
};

async function getData(type: (typeof ListType)[keyof typeof ListType] = 1) {
  const url = URL_GENERATOR(type);
  return await http.get(url, {});
}

function dataTransformer(data: HupuDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.title,
      description: item.title,
      image: '',
      url: `https://bbs.hupu.com/${item.tid}.html`,
      uniqueId: `hupu-${item.tid}`,
      spiderId,
      hotCount: item.replies + item.recommendNum || 0,
      tags: [item.username.length < 6 ? item.username : item.username.slice(0, 3) + '...'],
    };
  });
}

function mergeTypeData(data: HupuDataStructure[]): HupuDataStructure[] {
  return Object.keys(data).reduce((acc, cur) => {
    // @ts-expect-error sb 玩意
    return acc.concat(data[cur]);
  }, []);
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const tasks = Object.keys(ListType).map(async (key) => {
    const type = ListType[key as keyof typeof ListType];
    return await getData(type);
  });

  const requestedData: { data: { topicThreads: HupuDataStructure } }[] = await Promise.all(tasks);

  const result = mergeTypeData(requestedData.map((item) => item.data.topicThreads));

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
