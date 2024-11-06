import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {mergeHeaderObj} from "@/utils/mergeObject";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";

interface KrDataStructure {
  itemId: number;
  itemType: number;
  route: string;
  siteId: number;
  publishTime: number;
  templateMaterial: {
    itemId: number;
    templateType: number;
    widgetImage: string;
    widgetTitle: string;
    publishTime: number;
    authorName: string;
    statRead: number;
    statComment: number;
    statPraise: number;
    statFormat: string;
  }
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: '36kr',
  description: '36kr 爬虫',
}

const URL_GENERATOR = (type: string) => `https://gateway.36kr.com/api/mis/nav/home/nav/rank/${type}`;


const HTTP_CONFIG = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    partner_id: 'wap',
    param: {
      siteId: 1,
      platformId: 2,
    },
    timestamp: Date.now(),
  }
}

enum ListType {
  hot = 'hotRankList',
  // video = 'videoList',
  // comment = 'remarkList',
  // collect = 'collectList',
}

async function getData(type: keyof typeof ListType = 'hot') {
  const url = URL_GENERATOR(type);
  return await http.post(url, {
    ...HTTP_CONFIG.body
  }, {
    headers: HTTP_CONFIG.headers
  });
}

function genTagsForNews(data: KrDataStructure['templateMaterial']): string[] {
  // 遍历 templateMaterial ， 保存中长度小于五的字符串为 tag
  return Object.keys(data).reduce((acc, cur) => {
    const curData = data[cur as keyof KrDataStructure['templateMaterial']];

    if (curData === 'string' && curData.length < 6) {
      acc.push(curData)
    }
    return acc;
  }, [] as string[]);
}

function dataTransformer(data: KrDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.templateMaterial.widgetTitle,
      description: item.templateMaterial.widgetTitle,
      image: item.templateMaterial.widgetImage,
      url: `https://36kr.com/p/${item.itemId}`,
      uniqueId: `36kr-${item.itemId}`,
      spiderId,
      hotCount: item.templateMaterial.statRead,
      tags: genTagsForNews(item.templateMaterial)
    }
  });
}

function mergeTypeData(data: Record<keyof typeof ListType, KrDataStructure[]>): KrDataStructure[] {
  return Object.keys(data).reduce((acc, cur) => {
    // @ts-expect-error sb 玩意
    return acc.concat(data[cur]);
  }, []);
}



/**
 * main logic of getData from 36kr
 */
export default async function main () {
  const { id } = await spiderPublicLogic(SPIDER_INFO);


  const tasks = Object.keys(ListType).map(async (key) => {
    const type = key as keyof typeof ListType;
    return await getData(type);
  });

  const requestedData = await Promise.all(tasks);

  const result = mergeTypeData(requestedData.reduce((acc, cur) => {
    return mergeHeaderObj(acc, cur.data);
  }, {}) as Record<keyof typeof ListType, KrDataStructure[]>);

  const transformedData = dataTransformer(result, id);


  // data transform to your own format
  await checkAndOperateNews(transformedData);

  await updateSpiderUpdateTime(id);


  return transformedData;
}


