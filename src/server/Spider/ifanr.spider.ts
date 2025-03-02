import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';

interface IfanrDataStructure {
  buzz_original_url: string;
  comment_count: number;
  created_at: number;
  id: number;
  like_count: number;
  post_content: string;
  post_title: string;
  post_id: string;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'ifanr',
  description: 'ifanr 爬虫',
};

const URL_GENERATOR = () => `https://sso.ifanr.com/api/v5/wp/buzz/?limit=50&offset=0`;

async function getData(): Promise<{ objects: IfanrDataStructure[] }> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: IfanrDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    const { post_title, buzz_original_url, id, like_count, comment_count } = item;
    return {
      title: post_title,
      description: post_title,
      image: '',
      url: `https://www.ifanr.com/${id}` || buzz_original_url,
      uniqueId: `ifanr-${id}`,
      spiderId,
      hotCount: like_count + comment_count || 0,
      tags: [post_title.slice(0, 4)],
    };
  });
}

/**
 * main logic of getData from huxiu
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();

  const result = requestedData.objects;

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
