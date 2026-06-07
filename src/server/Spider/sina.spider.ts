import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { mergeHeaderObj } from '@/utils/mergeObject';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';

interface SinaDataStructure {
  '@type': string;
  base: {
    base: {
      dataid?: string;
      expId: string;
      modId: number;
      uniqueId: string;
      url: string;
    };
    decoration: {
      '@type': string;
      hotTag: Record<string, unknown>;
      hotValue: string;
      iconType: number;
    }[];
    dynamicName: string;
    recommendInfo: Record<string, unknown>;
    routeUri: string;
  };
  info: {
    hotValue: string;
    layoutStyle: number;
    showTag: string[];
    title: string;
  };
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'sina',
  description: 'sina 爬虫',
};

const URL_GENERATOR = (type: string) => `https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-${type}`;

const ListType = {
  all: '新浪热榜',
  // hotcmnt: "热议榜",
  // minivideo: "视频热榜",
  // ent: "娱乐热榜",
  // ai: "AI热榜",
  // auto: "汽车热榜",
  // mother: "育儿热榜",
  // fashion: "时尚热榜",
  // travel: "旅游热榜",
  // esg: "ESG热榜",
};

async function getData(type: keyof typeof ListType = 'all') {
  const url = URL_GENERATOR(type);
  return await http.get(url);
}

function dataTransformer(data: SinaDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    const { info, base } = item;
    return {
      title: info.title,
      description: info.title,
      image: '',
      url: base.base.url,
      uniqueId: `sina-${base.base.uniqueId}`,
      spiderId,
      hotCount: 0,
      tags: [info.hotValue],
    };
  });
}

function mergeTypeData(data: Record<keyof typeof ListType, SinaDataStructure[]>): SinaDataStructure[] {
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
    const type = key as keyof typeof ListType;
    return await getData(type);
  });

  const requestedData = await Promise.all(tasks);

  const result = mergeTypeData(
    requestedData.reduce((acc, cur) => {
      return mergeHeaderObj(acc, cur.data.hotList);
    }, {}) as Record<keyof typeof ListType, SinaDataStructure[]>
  );
  //
  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  //
  await updateSpiderUpdateTime(id);

  return transformedData;
}
