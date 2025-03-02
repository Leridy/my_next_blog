import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';

interface SspaiDataStructure {
  id: number;
  title: string;
  banner: string;
  summary: string;
  comment_count: number;
  like_count: number;
  view_count: number;
  free: boolean;
  post_type: number;
  important: number;
  released_time: number;
  morning_paper_title: string[];
  advertisement_url: string;
  series: string[];
  author: {
    id: number;
    slug: string;
    avatar: string;
    nickname: string;
  };
  corner: {
    id: number;
    name: string;
    url: string;
    icon: string;
    memo: string;
    color: string;
  };
  special_columns: string[];
  status: number;
  created_time: number;
  modify_time: number;
  is_matrix: boolean;
  is_recommend_to_home: boolean;
  slug: string;
  belong_to_member: boolean;
  issue: string;
  tags: {
    id: number;
    created_at: number;
    released_at: number;
    modify_at: number;
    title: string;
    intro: string;
    custom_url: string;
    views_count: number;
    recommend: boolean;
    weight: number;
    usable_user: boolean;
    usable_member: boolean;
    icon: string;
    icon_id: number;
    pai_read_recommend_on: boolean;
    color: string;
    synonyms: string;
    articles_count: number;
    articles: null;
    tags: null;
  }[];
  podcast_duration: number;
  article_limit_free: boolean;
  article_limit_free_stime: number;
  article_limit_free_etime: number;
  user_member_card_show_on: boolean;
  object_type: number;
  id_hash: string;
  recommend_to_home_at: number;
  is_pre_recommend_to_home: boolean;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'sspai',
  description: 'sspai 爬虫',
};

const URL_GENERATOR = (type: string) => `https://sspai.com/api/v1/article/tag/page/get?limit=15&tag=${type}`;

const ListType = ['热门文章', '应用推荐', '生活方式', '效率技巧', '少数派播客'];

async function getData(type: string): Promise<{ data: SspaiDataStructure[] }> {
  const url = URL_GENERATOR(type);
  return await http.get(url, {});
}

function dataTransformer(data: SspaiDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  const idSet = new Set<number>();
  return data
    .filter(({ id }) => {
      // filter duplicate id
      if (idSet.has(id)) {
        return false;
      }
      idSet.add(id);
      return true;
    })
    .map((item) => {
      const { title, banner, summary, id, like_count, comment_count, view_count, tags, author } = item;
      return {
        title: title,
        description: summary,
        image: banner || '',
        url: `https://sspai.com/post/${id}`,
        uniqueId: `sspai-${id}`,
        spiderId,
        hotCount: like_count + comment_count + view_count || 0,
        tags: tags.length > 0 ? tags.map((tag) => tag.title) : [author.nickname],
      };
    });
}

/**
 * main logic of getData from huxiu
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const tasks = ListType.map(async (type) => {
    return await getData(type);
  });

  const requestedData = await Promise.all(tasks);

  const result: SspaiDataStructure[] = requestedData.reduce((acc, cur) => {
    return acc.concat(cur.data);
  }, [] as SspaiDataStructure[]);

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
