import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';

interface ZhihuDataStructure {
  type: string;
  style_type: string;
  id: string;
  card_id: string;
  card_label: {
    type: string;
    icon: string;
    night_icon: string;
  };
  target: {
    id: number;
    title: string;
    url: string;
    type: string;
    created: number;
    answer_count: number;
    follower_count: number;
    author: {
      type: string;
      user_type: string;
      id: string;
      url_token: string;
      url: string;
      name: string;
      headline: string;
      avatar_url: string;
    };
    bound_topic_ids: number[];
    comment_count: number;
    is_following: boolean;
    excerpt: string;
  };
  attached_info: string;
  detail_text: string;
  trend: number;
  debut: boolean;
  children: {
    type: string;
    thumbnail: string;
  }[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'zhihu',
  description: 'zhihu 爬虫',
};

const URL_GENERATOR = () => `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&desktop=true`;

async function getData(): Promise<{ data: ZhihuDataStructure[] }> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: ZhihuDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.target.title,
      description: item.target.excerpt,
      image: item.children[0]?.thumbnail || '',
      // the url of zhihu is `https://www.zhihu.com/question/${item.target.id}`
      url: `https://www.zhihu.com/question/${item.target.id}`,
      uniqueId: `zhihu-${item.target.id}`,
      spiderId,
      hotCount: item.target.answer_count || 0,
      tags: [item.target.author.name || '', item.detail_text || ''],
    };
  });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const { data: result } = await getData();

  //
  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
