import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';

interface GeekParkDataStructure {
  comments_count: number;
  id: number;
  title: string;
  abstract: string;
  post_type: string;
  source: string | null;
  link: string | null;
  cover_url: string;
  provider: string | null;
  state: string;
  hidden: boolean;
  tags: string[];
  published_timestamp: number;
  published_at: string;
  views: number;
  recommended: boolean;
  h2_list: string[];
  img_list: string[];
  img_count: number;
  reading_time: number;
  extra: {
    video_id: string;
  };
  column: {
    id: number;
    title: string;
    description: string;
    column_visible: boolean;
    banner_url: string;
  };
  audio: string | null;
}

interface GeekParkResponse {
  homepage_posts: {
    post: GeekParkDataStructure;
  }[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'geekpark',
  description: 'geekpark 爬虫',
};

const URL_GENERATOR = () => `https://mainssl.geekpark.net/api/v2`;

async function getData(): Promise<GeekParkResponse> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(
  data: GeekParkDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  return data.map((item) => {
    const { title, abstract, id, cover_url, link, tags, views } = item;

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
      title,
      description: abstract || title,
      image: cover_url || '',
      url: link || `https://www.geekpark.net/news/${id}`,
      uniqueId: `geekpark-${id}`,
      spiderId,
      hotCount: views || 0,
      tags: Array.from(new Set([...tags])),
    };

    return transformedItem;
  });
}

/**
 * main logic of getData from GeekPark
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  // 获取极客公园数据
  const rawData = await getData();

  // 确保result存在
  if (!rawData) {
    throw new Error('获取极客公园数据失败');
  }

  const result = rawData.homepage_posts || [];

  if (!result || result.length === 0) {
    throw new Error('获取极客公园数据失败');
  }

  const transformedResult = result.map(({ post }) => post);

  // 转换数据格式
  const transformedData = dataTransformer(transformedResult, id);

  // 检查并操作新闻数据
  await checkAndOperateNews(transformedData);

  // 更新爬虫更新时间
  await updateSpiderUpdateTime(id);

  return transformedData;
}
