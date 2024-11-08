import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";

interface V2exNode {
  avatar_large: string;
  name: string;
  avatar_normal: string;
  title: string;
  url: string;
  topics: number;
  footer: string;
  header: string;
  title_alternative: string;
  avatar_mini: string;
  stars: number;
  aliases: string[];
  root: boolean;
  id: number;
  parent_node_name: string;
}

interface V2exMember {
  id: number;
  username: string;
  url: string;
  website: string;
  twitter: string;
  psn: string;
  github: string;
  btc: string;
  location: string;
  tagline: string;
  bio: string;
  avatar_mini: string;
  avatar_normal: string;
  avatar_large: string;
  avatar_xlarge: string;
  avatar_xxlarge: string;
  created: number;
  last_modified: number;
}

interface V2exDataStructure {
  last_reply_by: string;
  last_touched: number;
  title: string;
  url: string;
  created: number;
  deleted: number;
  content: string;
  content_rendered: string;
  last_modified: number;
  replies: number;
  id: number;
  node: V2exNode;
  member: V2exMember;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'v2ex',
  description: 'v2ex 爬虫',
}

const URL_GENERATOR = (type: string | number) => `https://www.v2ex.com/api/topics/${type}.json`;


const ListType = {
  "最热主题": 'hot',
  "最新主题": 'latest',
}

async function getData(type: typeof ListType[keyof typeof ListType] = 'hot'): Promise<V2exDataStructure[]> {
  const url = URL_GENERATOR(type);
  return await http.get(url, {});
}

function dataTransformer(data: V2exDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.title,
      description: item.title,
      image: '',
      url: item.url,
      uniqueId: `v2ex-${item.id}`,
      spiderId,
      hotCount: item.replies || 0,
      tags: [item.node.title]
    }
  });
}

function mergeTypeData(data: V2exDataStructure[][]): V2exDataStructure[] {
  return data.reduce((acc, cur) => {
    return acc.concat(cur);
  }, []);
}


/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);


  const tasks = Object.keys(ListType).map(async (key) => {
    const type = ListType[key as keyof typeof ListType];
    return await getData(type);
  });

  const requestedData: V2exDataStructure[][] = await Promise.all(tasks);

  const result = mergeTypeData(requestedData);

  const transformedData = dataTransformer(result, id);


  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);


  return transformedData;
}


