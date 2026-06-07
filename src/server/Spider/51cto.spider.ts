import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';
import { getToken, sign } from '@/server/Spider/utils/getToken/51cto';

interface FiveOneCTODataStructure {
  _id: {
    $oid: string;
  };
  article_id: number;
  parent_topic_ids: number[];
  topic_ids: number[];
  editor_id: number;
  author_id: number;
  article_type: never[];
  title: string;
  url: string;
  cover: string;
  abstract: string;
  is_recommend: number;
  rec_content: number;
  created_at: number;
  updated_at: number;
  pubdate: string;
  topping_time: number;
  source_id: number;
  keyword: {
    name: string;
    url: string;
  }[];
  factor_pub_date: string;
  factor_up_date: string;
  source_type: string;
  content_type: never[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: '51cto',
  description: '51cto 爬虫',
};

const URL_GENERATOR = () => `https://api-media.51cto.com/index/index/recommend`;

async function getData(): Promise<{
  data: { data: { list: FiveOneCTODataStructure[] } };
}> {
  const url = URL_GENERATOR();
  const params = {
    page: 1,
    page_size: 50,
    limit_time: 0,
    name_en: '',
  };
  const timestamp = Date.now();
  const token = await getToken();

  return await http.get(url, {
    params: {
      ...params,
      timestamp,
      token,
      sign: sign(url, params, timestamp, token),
    },
  });
}

function dataTransformer(data: FiveOneCTODataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    const { title, abstract: description, cover: image, url, article_id: uniqueId } = item;
    return {
      title,
      description,
      image,
      url,
      uniqueId: `51cto-${uniqueId}`,
      spiderId,
      hotCount: 0,
      tags: item.keyword.map((tag) => tag.name),
    };
  });
}

/**
 * main logic of getData from 51cto
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();

  const result = requestedData.data.data.list.filter((ele) => Object.keys(ele).length > 20);
  //
  const transformedData = dataTransformer(result, id);
  //
  //
  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return { transformedData, result };
}
