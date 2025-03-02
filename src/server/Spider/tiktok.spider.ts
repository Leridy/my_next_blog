import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';

interface TiktokDataStructure {
  article_detail_count: number;
  can_extend_detail: boolean;
  discuss_video_count: number;
  display_style: number;
  event_time: number;
  group_id: string;
  hot_value: number;
  hotlist_param: string;
  is_n1: boolean;
  label: number;
  max_rank: number;
  position: number;
  sentence_id: string;
  sentence_tag: number;
  video_count: number;
  word: string;
  word_cover: {
    uri: string;
    url_list: string[];
  };
  word_type: number;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'tiktok',
  description: 'tiktok 爬虫',
};

const URL_GENERATOR = () =>
  'https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1';

const getDyCookies = async (): Promise<string> => {
  try {
    const cookisUrl =
      'https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383';
    const result = await http.get(cookisUrl, {
      headers: { originaInfo: true, 'return-raw': true },
    });
    const { headers } = result;
    // @ts-expect-error regex is required
    const pattern = /passport_csrf_token=(.*); Path/s;
    const matchResult = headers?.['set-cookie']?.[0].match(pattern);
    return matchResult?.[1] || '';
  } catch (error) {
    console.error('获取抖音 Cookie 出错' + error);
    return '';
  }
};

async function getData(): Promise<{
  data: { word_list: TiktokDataStructure[] };
}> {
  const url = URL_GENERATOR();
  const cookie = await getDyCookies();
  return await http.get(url, {
    headers: {
      Cookie: `passport_csrf_token=${cookie}`,
    },
  });
}

function dataTransformer(
  data: TiktokDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  return data.map((item) => {
    return {
      title: item.word,
      description: item.word,
      image: '',
      url: `https://www.douyin.com/hot/${item.sentence_id}`,
      uniqueId: `tiktok-${item.sentence_id}`,
      spiderId,
      hotCount: item.hot_value,
      // 从 word 里面随机提取标签
      tags: [item.word.slice(0, 5)],
    };
  });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();
  const result = requestedData.data.word_list;

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
