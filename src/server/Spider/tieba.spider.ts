import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";

interface TiebaDataStructure {
  topic_id: number;
  topic_name: string;
  topic_desc: string;
  abstract: string;
  topic_pic: string;
  tag: number;
  discuss_num: number;
  idx_num: number;
  create_time: number;
  content_num: number;
  topic_avatar: string;
  is_video_topic: string;
  topic_url: string;
  topic_default_avatar: string;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'tieba',
  description: 'tieba 爬虫',
}

const URL_GENERATOR = () => `https://tieba.baidu.com/hottopic/browse/topicList`


async function getData(): Promise<{ data: { bang_topic: { topic_list: TiebaDataStructure[] } } }> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: TiebaDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    const {topic_name, topic_desc, topic_pic, topic_url, topic_id} = item;
    return {
      title: topic_name,
      description: topic_desc,
      image: topic_pic,
      url: topic_url,
      uniqueId: `tieba-${topic_id}`,
      spiderId,
      hotCount: item.discuss_num || 0,
      tags: [topic_name.slice(0, 4)]
    }
  });
}

/**
 * main logic of getData from tieba
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();


  const result: TiebaDataStructure[] = requestedData.data.bang_topic.topic_list;

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);


  return transformedData;
}


