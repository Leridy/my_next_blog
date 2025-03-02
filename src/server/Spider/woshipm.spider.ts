import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';

interface WoshipmDataStructure {
  controlTypeCode: number;
  data: {
    articleAuthor: string;
    articleAuthorAvatar: string;
    articleSummary: string;
    articleTitle: string;
    collectedCount: number;
    follow: boolean;
    id: number;
    imageUrl: string;
    publishTime: number;
    recommend: boolean;
    stick: boolean;
    tag: string;
    timeStr: string;
    type: string;
    uid: number;
    userTags: {
      uid: number;
      tagCode: number;
      parentCode: number;
      sindex: number;
      icon_2: string;
      parentDesc: string;
      tagName: string;
      url: string;
      icon_1: string;
    }[];
  };
  scores: number;
  trueScores: number;
}

interface WoshipmResponse {
  CODE: number;
  MESSAGE: string;
  REQUEST_ID: string;
  HOST_ID: string;
  RESULT: WoshipmDataStructure[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'woshipm',
  description: 'woshipm 爬虫',
};

const URL_GENERATOR = () =>
  `https://www.woshipm.com/api2/app/article/popular/daily`;

async function getData(): Promise<WoshipmResponse> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(
  data: WoshipmDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  | 'title'
  | 'url'
  | 'description'
  | 'image'
  | 'spiderId'
  | 'uniqueId'
  | 'hotCount'
  | 'tags'
>[] {
  return data.map((item) => {
    const {
      data: { articleTitle, articleSummary, id, imageUrl, tag, articleAuthor },
      scores,
    } = item;

    const tags = tag.split(' ').filter(Boolean);

    const transformedItem: Pick<
      HotNews,
      | 'title'
      | 'url'
      | 'description'
      | 'image'
      | 'spiderId'
      | 'uniqueId'
      | 'hotCount'
      | 'tags'
    > = {
      title: articleTitle,
      description: articleSummary || articleTitle,
      image: imageUrl || '',
      url: `https://www.woshipm.com/pd/${id}.html`,
      uniqueId: `woshipm-${id}`,
      spiderId,
      hotCount: scores || 0,
      tags: Array.from(new Set([...tags, articleAuthor])),
    };

    return transformedItem;
  });
}

/**
 * main logic of getData from woshipm
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  // 获取人人都是产品经理数据
  const rawData = await getData();

  // 确保result存在
  if (!rawData) {
    throw new Error('获取人人都是产品经理数据失败');
  }

  const result = rawData?.RESULT || [];

  if (!result || result.length === 0) {
    throw new Error('获取人人都是产品经理数据失败');
  }

  // 转换数据格式
  const transformedData = dataTransformer(result, id);

  // 检查并操作新闻数据
  await checkAndOperateNews(transformedData);

  // 更新爬虫更新时间
  await updateSpiderUpdateTime(id);

  return transformedData;
}
