import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';
import {
  parseLotteryHtml,
  LotteryResult,
} from '@/server/Spider/utils/getToken/lottery';

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'lottery',
  description: 'lottery 爬虫',
};

const URL_GENERATOR = () => `https://m.500.com/info/kaijiang/`;

async function getData(): Promise<string> {
  const url = URL_GENERATOR();
  return await http.get(url, {
    responseType: 'arraybuffer',
    transformResponse: [
      (data) => {
        const decoder = new TextDecoder('gbk');
        return decoder.decode(data);
      },
    ],
  });
}

function dataTransformer(
  data: LotteryResult[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  const now = new Date();
  return data
    .filter(({ date, name, numbers }) => {
      if (!name || !date || !numbers) return false;
      // 获取 date 的数字部分初始化成 Date 对象，然后和当前时间比较，超过一个月的数据不要 date 的格式是 "2021-11-30 星期二" 或者 "2021-11-30星期二"
      const dateStr = date.replace(/[\u4e00-\u9fa5]/g, '');
      const dateObj = new Date(dateStr);
      return dateObj.getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000;
    })
    .map((item, index, array) => {
      const { code, name, numbers, period, link } = item;
      return {
        title: `${name}-第${period}-${numbers}`,
        description: `${name} 第${period} 期开奖号码为 ${numbers} 点击查看历史开奖号码`,
        image: '',
        url: link,
        uniqueId: `lottery-${code}-${name}-${period}`,
        spiderId,
        hotCount: array.length - index,
        tags: [name],
      };
    });
}

export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();

  const result = parseLotteryHtml(
    requestedData.replace(/[\r\n\t]/g, '').replace(/\s+/g, ' ')
  );

  const transformedData = dataTransformer(result, id);

  await checkAndOperateNews(transformedData);
  await updateSpiderUpdateTime(id);

  return transformedData;
}
