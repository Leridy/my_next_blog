import {MyNRError} from "@/utils/MyNRError";
import {HotNews, HotSpider, setting} from "@prisma/client";
import SpiderDao from "@/server/db/dao/spider.dao";
import {getSetting, updateSetting} from "@/server/Spider/utils/setting.cache";
import SettingDao from "@/server/db/dao/setting.dao";
import NewsDao from "@/server/db/dao/news.dao";

const isProd = process.env.CURRENT_ENV === 'production';

const SITE_SETTING_KEY = 'Spider';

const settings = await getSpiderSetting();

async function getSpiderSetting() {
  const settings = getSetting();
  if (settings) {
    return settings;
  } else {
    const settingsData = await SettingDao.get({key: SITE_SETTING_KEY, role: '2'});
    const settingsMap = new Map<string, setting>();
    if (Array.isArray(settingsData) && settingsData.length > 0) {
      settingsData.forEach((item) => {
        settingsMap.set(item.key, item);
      });
    }

    updateSetting(settingsMap);
    return settingsMap;
  }
}

/**
 * get spider id from ithome and update the time;
 */
async function getSpiderIdAndUpdateTime(SPIDER_INFO: Pick<HotSpider, 'name' | 'description'>): Promise<Pick<HotSpider, 'updatedAt' | 'id'>> {
  // get spider id from database
  const spiderResult = await SpiderDao.get({name: SPIDER_INFO.name, description: SPIDER_INFO.description});
  let spiderInfo: HotSpider | null = null;

  // if a spider result is array, get the first one
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


export async function spiderPublicLogic(SPIDER_INFO: Pick<HotSpider, 'name' | 'description'>) {
  const {updatedAt, id} = await getSpiderIdAndUpdateTime(SPIDER_INFO);
  console.log(`spider ${SPIDER_INFO.name} with id ${id} start to working`);

  // check settings
  if (!settings) {
    throw new Error('无法获取设置信息');
  }

  // 默认间隔一小时
  const interval: number = settings.get(`${SITE_SETTING_KEY}.interval`)?.value ? Number(settings.get(`${SITE_SETTING_KEY}.interval`)?.value) * 1000 * 60 : 1000 * 60 * 60;


  // 检查刷新间隔是否满足 interval
  if (Date.now() - new Date(updatedAt).getTime() < interval && isProd) {
    throw new MyNRError('刷新间隔未到', 403, {
      interval,
      updatedAt: new Date(updatedAt).getTime(),
      now: Date.now()
    })
  } else {
    updateSetting(null);
  }

  return {
    settings,
    updatedAt,
    id
  }
}


export async function updateSpiderUpdateTime(id: number) {
  console.log(`spider ${id} update time and work ends`);
  return SpiderDao.update(id);
}

/**
 * 这个是数据的更新逻辑
 * check if the news is already in database update or create
 * @param data
 */
export async function checkAndOperateNews(data: Pick<HotNews, 'title' | 'uniqueId' | 'url' | 'image' | 'description'>[]) {
  // check if the news is already in database update or create
  const tasks = data.map(async (item) => {
    const news = await NewsDao.get({uniqueId: item.uniqueId});
    try {
      if (Array.isArray(news) && news.length > 0) {
        return await NewsDao.update(news[0].id, item);
      } else {
        return await NewsDao.create(item);
      }
    } catch (e) {
      throw new MyNRError('数据更新/创建失败', 500, {
        data: item,
        originError: e
      });
    }

  });

  return await Promise.all(tasks);
}
