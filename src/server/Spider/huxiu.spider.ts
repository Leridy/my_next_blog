import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";

interface HuxiuDataStructure {
  object_type: number;
  object_id: number;
  content: string;
  publish_time: number;
  url: string;
  comment_status: number;
  is_agree: boolean;
  is_favorite: boolean;
  status: number;
  is_hot: boolean;
  type: number;
  agree_icon: string;
  count_info: {
    total_comment_num: number;
    agree_num: number;
    favorite_num: number;
    reward_num: number;
  }
  user_info: {
    uid: number;
    username: string;
    avatar: string;
    yijuhua: string;
    user_icons: {
      name: string;
      order: string;
      type: number;
      icon_path: string;
      icon_night_path: string;
      position_id: number;
    }[]
    ip_url: string;
  }
  reward_status: number;
  is_reward: boolean;
  is_follow: boolean;
  comment: {
    total: number;
    total_page: number;
    cur_page: number;
    datalist: {
      comment_id: number;
      parent_comment_id: number;
      to_comment_id: number;
      object_type: number;
      object_id: number;
      user_info: {
        uid: number;
        username: string;
      },
      content: string;
      region: string;
    }[]
  };
  format_time: string;
  is_allow_edit_reward: boolean;
  is_allow_share: boolean;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'huxiu',
  description: 'huxiu 爬虫',
}

const URL_GENERATOR = () => `https://www.huxiu.com/moment/`


// 标题处理
const titleProcessing = (text: string) => {
  const paragraphs = text.split("<br><br>");
  const title = paragraphs?.shift()?.replace(/。$/, "") || "";
  const intro = paragraphs.join("<br><br>");
  return {title, intro};
};


async function getData(): Promise<string> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: HuxiuDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.filter(item => Boolean(item.url)).map((item, index) => {
    return {
      title: titleProcessing(item.content).title,
      description: titleProcessing(item.content).intro,
      image: item.user_info.avatar || '',
      url: item.url || `https://www.huxiu.com/moment?from=pc&index=${index}`,
      uniqueId: `huxiu-${item.object_id}`,
      spiderId,
      hotCount: item.count_info.agree_num + item.count_info.total_comment_num || 0,
      tags: [item.user_info.username]
    }
  });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);

  const pattern = /<script>[\s\S]*?window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/;


  const requestedData: string = await getData();

  const matchResult = requestedData.match(pattern);
  const result = JSON.parse(<string>matchResult?.[1]).moment.momentList.moment_list.datalist;

  const transformedData = dataTransformer(result, id);


  try {
    // data transform to your own format
    await checkAndOperateNews(transformedData);
  } catch (e) {
    console.error(e);
  } finally {
    // update spider update time
    await updateSpiderUpdateTime(id);
  }


  return transformedData;
}


