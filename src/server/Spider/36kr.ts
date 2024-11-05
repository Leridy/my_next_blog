import http from "./http";
import {HotNews, HotSpider, setting} from "@prisma/client";
import SpiderDao from "@/server/db/dao/spider.dao";
import SettingDao from "@/server/db/dao/setting.dao";
import {getSetting, updateSetting} from "@/server/Spider/utils/setting.cache";
import {MyNRError} from "@/utils/MyNRError";
import {mergeHeaderObj} from "@/utils/mergeObject";
import NewsDao from "@/server/db/dao/news.dao";

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

const SITE_SETTING_KEY = 'Spider';

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

async function getSpiderSetting() {
  const settings = getSetting();
  if (settings) {
    return settings;
  } else {
    const settingsData = await SettingDao.get({key: SITE_SETTING_KEY, role: '2'});
    const settingsMap = new Map<string, setting>();
    if (Array.isArray(settingsData) && settingsData.length > 0) {
      settingsData.forEach((item) => {
        settingsMap.set(item.label, item);
      });
    }

    updateSetting(settingsMap);
    return settingsMap;
  }
}

/**
 * get spider id from 36kr;
 */
async function getSpiderIdAndUpdateTime(): Promise<Pick<HotSpider, 'updatedAt' | 'id'>> {
  // get spider id from database
  const spiderResult = await SpiderDao.get({name: SPIDER_INFO.name, description: SPIDER_INFO.description});
  let spiderInfo: HotSpider | null = null;

  // if spider result is array, get the first one
  if (Array.isArray(spiderResult) && spiderResult.length > 0) {
    spiderInfo = spiderResult[0];
  } else if (spiderResult !== null && !Array.isArray(spiderResult)) {
    spiderInfo = spiderResult;
  }

  if (spiderInfo !== null) {
    return {
      id: spiderInfo.id,
      updatedAt: spiderInfo.updatedAt
    }
  } else {
    // create spider info
    const result = await SpiderDao.create(SPIDER_INFO);
    return {
      id: result.id,
      updatedAt: result.updatedAt
    }
  }
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
    if (typeof data[cur as keyof KrDataStructure['templateMaterial']] === 'string' && data[cur as keyof KrDataStructure['templateMaterial']].length < 6) {
      // @ts-expect-error sb 玩意
      acc.push(data[cur as keyof KrDataStructure['templateMaterial']]);
    }
    return acc;
  }, []);
}

function dataTransform(data: KrDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
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
    return acc.concat(data[cur]);
  }, []);
}

async function checkAndOperateNews(data: Pick<HotNews, 'title' | 'uniqueId' | 'url' | 'image' | 'description'>[]) {
  // check if the news is already in database update or create
  const tasks = data.map(async (item) => {
    const news = await NewsDao.get({uniqueId: item.uniqueId});

    if (Array.isArray(news) && news.length > 0) {
      return NewsDao.update(news[0].id, item);
    } else {
      return await NewsDao.create(item);
    }
  });

  return await Promise.all(tasks);
}

async function updateSpiderUpdateTime(id: number) {
  return SpiderDao.update(id);
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id, updatedAt} = await getSpiderIdAndUpdateTime();
  const settings = await getSpiderSetting();

  // check settings
  if (!settings) {
    throw new Error('无法获取设置信息');
  }

  // 默认间隔一小时
  const interval: number = settings.get(`${SITE_SETTING_KEY}.interval`)?.value ? Number(settings.get(`${SITE_SETTING_KEY}.interval`)?.value) * 1000 * 60 : 1000 * 60 * 60;

  // 检查刷新间隔是否满足 interval
  if (Date.now() - new Date(updatedAt).getTime() < interval) {
    console.log(interval, Date.now() - new Date(updatedAt).getTime());
    throw new MyNRError('刷新间隔未到', 403, {
      interval,
      updatedAt: new Date(updatedAt).getTime(),
      now: Date.now()
    })
  }

  const tasks = Object.keys(ListType).map(async (key) => {
    const type = key as keyof typeof ListType;
    return await getData(type);
  });


  const requestedData = await Promise.all(tasks);

  const result = mergeTypeData(requestedData.reduce((acc, cur) => {
    return mergeHeaderObj(acc, cur.data);
  }, {}) as Record<keyof typeof ListType, KrDataStructure[]>);

  const transformedData = dataTransform(result, id);



  // data transform to your own format
  await checkAndOperateNews(transformedData);
  await updateSpiderUpdateTime(id);


  return transformedData;
}


