import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';
import { load } from 'cheerio';

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'ithome',
  description: 'ithome 爬虫',
};

const URL_GENERATOR = 'https://m.ithome.com/rankm/';

// 链接处理
const replaceLink = (url: string, getId: boolean = false) => {
  const match = url.match(/[html|live]\/(\d+)\.htm/);
  // 是否匹配成功
  if (match && match[1]) {
    return getId
      ? match[1]
      : `https://www.ithome.com/0/${match[1].slice(0, 3)}/${match[1].slice(3)}.htm`;
  }
  // 返回原始 URL
  return url;
};

async function getData() {
  return await http.get(URL_GENERATOR, {});
}

function genTagsForNews(title: string): string[] {
  // 随机取最前面的四到五个 字符作为标签
  return [title.slice(0, Math.random() * 2 + 4)];
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const [requestedData] = await Promise.all([getData()]);

  const $ = load(requestedData as unknown as string);

  const listDom = $('.rank-box .placeholder');
  const result: Pick<
    HotNews,
    | 'title'
    | 'description'
    | 'image'
    | 'url'
    | 'uniqueId'
    | 'spiderId'
    | 'hotCount'
    | 'tags'
  >[] = listDom.toArray().map((item) => {
    const dom = $(item);
    const href = dom.find('a').attr('href');
    return {
      title: dom.find('.plc-title').text().trim(),
      description: dom.find('.plc-title').text().trim(),
      image: dom.find('img').attr('data-original') || '',
      url: href ? replaceLink(href) : '',
      uniqueId: `ithome-${href ? replaceLink(href, true) : 100000}`,
      spiderId: id,
      hotCount: Number(dom.find('.review-num').text().replace(/\D/g, '')),
      tags: genTagsForNews(dom.find('.plc-title').text().trim()),
    };
  });
  await checkAndOperateNews(result);
  await updateSpiderUpdateTime(id);

  return result;
}
