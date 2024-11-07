import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";
import getBiliWbi from "@/server/Spider/utils/getToken/bilibili";
import {AxiosResponse} from "axios";

interface BilibiliDataStructure1 {
  aid: number;
  videos: number;
  tid: number;
  tname: string; // 分类名
  author: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;  // 发布时间
  ctime: number; // 创建时间
  desc: string;
  state: number;
  duration: string; // 时长
  mission_id: number;
  rights: {
    bp: number;
    elec: number;
    download: number;
    movie: number;
    pay: number;
    hd5: number;
    no_reprint: number;
    autoplay: number;
    ugc_pay: number;
    is_cooperation: number;
    ugc_pay_preview: number;
    no_background: number;
  }
  owner: {
    mid: number;
    name: string;
    face: string;
  }
  stat: {
    aid: number;
    view: number;
    danmaku: number;
    reply: number;
    favorite: number;
    coin: number;
    share: number;
    now_rank: number;
    his_rank: number;
    like: number;
    dislike: number;
  }
  dynamic: string;
  cid: number;
  dimension: {
    width: number;
    height: number;
    rotate: number;
  }
  short_link_v2: string;
  first_frame: string;
  pub_location: string;
  cover43: string;
  bvid: string;
  score: number;
  enable_vt: boolean;
}

interface BilibiliDataStructure2 {
  aid: number;
  bvid: string;
  author: string;
  coins: number;
  duration: string;
  mid: number; // 作者id
  pic: string;
  cid: number;
  play: number;
  pts: number;
  title: string;
  trend: null;
  video_review: number;
  "rights": {
    "bp": number;
    "elec": number;
    "download": number;
    "movie": number;
    "pay": number;
    "hd5": number;
    "no_reprint": number;
    "autoplay": number;
    "ugc_pay": number;
    "is_cooperation": number;
    "ugc_pay_preview": number;
    "no_background": number;
    "arc_pay": number;
    "pay_free_watch": number;
  }
}

interface BilibiliResponse<T> {
  note: string;
  list: T[];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'bilibili',
  description: 'bilibili 爬虫',
}

const URL_GENERATOR = (type: number, wbiData: string) => `https://api.bilibili.com/x/web-interface/ranking/v2?tid=${type}&type=all&${wbiData}`
const URL_GENERATOR_BACKUP = (type: number) => `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp?rid=${type}&type=1&callback=__jp0`


const HTTP_CONFIG = {
  method: 'GET',
  headers: {
    Referer: 'https://www.bilibili.com/ranking/all',
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  },
}

const ListType = {
  "全站": 0,
  // "动画" = 1,
  // "音乐" = 3,
  // "游戏" = 4,
  // "娱乐" = 5,
  // "科技" = 36,
  // "鬼畜" = 119,
  // "舞蹈" = 129,
  // "数码" = 188,
  // "生活" = 160,
  // "时尚" = 155,
  // "影视" = 181,
}

async function getData(type: typeof ListType[keyof typeof ListType] = 0, spiderId: number) {
  const wbiData = await getBiliWbi();
  const url = URL_GENERATOR(type, wbiData);
  const backupUrl = URL_GENERATOR_BACKUP(type);
  let res:AxiosResponse<BilibiliResponse<BilibiliDataStructure1>> | AxiosResponse<BilibiliResponse<BilibiliDataStructure2>> = await http.get<BilibiliResponse<BilibiliDataStructure1>>(url, {headers: HTTP_CONFIG.headers});

  let finalData: Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] = [];

  if (!Array.isArray(res.data?.list)) {
    res = await http.get<BilibiliResponse<BilibiliDataStructure2>>(backupUrl, {headers: HTTP_CONFIG.headers});
    finalData = dataTransformer2(res.data.list, spiderId);
  } else {
    finalData = dataTransformer1(res.data.list, spiderId);
  }

  return finalData;
}

function dataTransformer1(data: BilibiliDataStructure1[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.title,
      description: item.desc,
      image: item.pic,
      url: item.short_link_v2,
      uniqueId: `bilibili-${item.aid}`,
      spiderId,
      hotCount: item?.stat?.like || item.state,
      tags: [item.tname]
    }
  });
}

function dataTransformer2(data: BilibiliDataStructure2[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.title,
      description: item.title,
      image: item.pic,
      // bilibili video url + bvid
      url: `https://www.bilibili.com/video/${item.bvid}`,
      uniqueId: `bilibili-${item.aid}`,
      spiderId,
      hotCount: item.play,
      tags: [item.author]
    }
  });
}

function mergeTypeData<T>(data: T[][]): T[] {
  return data.reduce((acc, cur) => {
    return acc.concat(cur);
  }, [] as T[]);
}


/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);


  const tasks = Object.keys(ListType).map(async (key) => {
    const type = ListType[key as keyof typeof ListType]
    return await getData(type, id);
  });

  const requestedData = await Promise.all(tasks);

  const transformedData = mergeTypeData(requestedData);


  // // data transform to your own format
  await checkAndOperateNews(transformedData);
  await updateSpiderUpdateTime(id);


  return {transformedData};
}


