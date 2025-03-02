import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';

interface JuejinDataStructure {
  content: {
    content_id: string; // 文章id
    item_type: number; // 类型
    format: string; // 格式
    author_id: string; // 作者id
    title: string; // 标题
    brief: string; // 简介
    status: number; // 状态
    ctime: number; // 创建时间
    mtime: number; // 修改时间
    category_id: number; // 分类id
    tag_ids: string[]; // 标签id
  };
  content_counter: {
    view: number; // 浏览数
    like: number; // 点赞数
    collect: number; // 收藏数
    hot_rank: number; // 热榜排名
    comment_count: number; // 评论数
    interest_count: number; // 点赞数
  };
  author: {
    user_id: string; // 用户id
    name: string; // 用户名
    avatar: string; // 头像
    is_followed: boolean; // 是否关注
  };
  author_counter: {
    level: number; // 等级
    power: number; // 力量
    follower: number; // 粉丝数
    publish: number; // 发布数
    view: number; // 浏览数
    like: number; // 点赞数
    hot_rank: number; // 热榜排名
  };
  user_interact: {
    // 用户交互
    is_user_like: boolean; // 是否点赞
    is_user_collect: boolean; // 是否收藏
    is_follow: boolean; // 是否关注
  };
}

interface JuejinResponse<T> {
  err_no: number;
  err_msg: string;
  data: T[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'juejin',
  description: 'juejin 爬虫',
};

const URL_GENERATOR = () =>
  `https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot`;

async function getData(): Promise<JuejinResponse<JuejinDataStructure>> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(
  data: JuejinDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  return data.map((item) => {
    const { content_counter, author, content } = item;
    return {
      title: content.title,
      description: content.brief || content.title,
      image: '',
      url: `https://juejin.cn/post/${content.content_id}`,
      uniqueId: `juejin-${content.content_id}`,
      spiderId,
      hotCount:
        content_counter.like +
        content_counter.comment_count +
        content_counter.hot_rank,
      tags: [
        author.name.length < 6 ? author.name : author.name.slice(0, 3) + '...',
      ],
    };
  });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const result = await getData();

  const transformedData = dataTransformer(result.data, id);

  // // data transform to your own format
  await checkAndOperateNews(transformedData);
  // // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
