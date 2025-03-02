import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';

interface QQNewsDataStructure {
  id: string;
  a_ver: string;
  articletype: string;
  title: string;
  chlid: string;
  commentid: string;
  longtitle: string;
  surl: string;
  short_url: string;
  url: string;
  time: string;
  timestamp: number;
  abstract: string;
  disableDelete: number;
  comments: number;
  alg_version: number;
  card: {
    chlid: string;
    chlname: string;
    desc: string;
    icon: string;
    sicon: string;
    uin: string;
    update_frequency: string;
    vip_desc: string;
    vip_icon_night: string;
    vip_place: string;
    vip_type: string;
    vip_icon: string;
    medal_info: {
      type_id: number;
      medal_id: number;
      medal_level: number;
      medal_name: string;
      medal_desc: string;
      night_url: string;
      daytime_url: string;
    };
    vip_type_new: string;
    suid: string;
    liveInfo: {
      roomID: string;
      roomStatus: string;
    };
    cpLevel: number;
  };
  chlmrk: string;
  chlsicon: string;
  media_id: string;
  chlname: string;
  source: string;
  chlicon: string;
  qualityScore: string;
  uinnick: string;
  uinname: string;
  tag: string[];
  commentGifSwitch: number;
  forbidCommentUpDown: number;
  forbidExpr: number;
  emojiRelatedSwitch: number;
  emojiSwitch: number;
  openAds: number;
  openAdsText: number;
  openRelatedNewsAd: number;
  openAdsComment: number;
  show_expr: number;
  showType_video: string;
  picShowType: number;
  thumbnails: string[];
  thumbnails_big: string[];
  bigImage: string[];
  thumbnails_qqnews_photo: string[];
  thumbnails_qqnews: string[];
  newsModule: Record<string, string>;
  labelList: {
    color: string;
    nightColor: string;
    textColor: string;
    textNightColor: string;
    word: string;
    type: number;
    typeName: string;
  }[];
  readCount: number;
  shareUrl: string;
  likeInfo: number;
  closeAllAd: number;
  commentNum: number;
  gifRelatedSwitch: number;
  commentSyncWeibo: number;
  tmp3pic: string[];
  miniProShareImage: string;
  textShareType: string;
  shareDoc: {
    shareDataToFriend: {
      shareTitle: string;
      shareSubTitle: string;
      shareImg: string;
    };
    shareDataToCircle: {
      shareTitle: string;
      shareSubTitle: string;
      shareImg: string;
    };
    shareDataToQQFriend: {
      shareTitle: string;
      shareSubTitle: string;
      shareImg: string;
    };
    shareDataToQZone: {
      shareTitle: string;
      shareSubTitle: string;
      shareImg: string;
    };
    shareDataToWeibo: {
      shareTitle: string;
      shareSubTitle: string;
      shareImg: string;
    };
  };
  enableDiffusion: number;
  shareCount: number;
  tlTitle: string;
  NewsSource: string;
  disableInsert: string;
  hotEvent: {
    id: string;
    ranking: number;
    title: string;
    hotScore: number;
    is_top: number;
  };
  ranking: number;
  pubInfo: {
    source: string;
    sub_source: string;
  };
  fimgUrl: Record<string, string>;
  nlpAbstract: string;
  collect_count: number;
  switch_control: Record<string, string>;
  interaction_info: Record<string, string>;
  extra_property: Record<string, string>;
  userAddress: string;
  hippyTransMap: {
    is_top: number;
  };
  origin_url_cctvnews: string;
  contentWorldsNum: number;
}

interface QQNewsResponse<T> {
  ret: number;
  idlist: [
    {
      ids_hash: string;
      has_more: number;
      newslist: T[];
    },
  ];
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'QQNews',
  description: 'QQNews 爬虫',
};

const URL_GENERATOR = () =>
  `https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50`;

async function getData(): Promise<QQNewsResponse<QQNewsDataStructure>> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(
  data: QQNewsDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  return data
    .filter((item) => Object.keys(item).length >= 60)
    .map((item) => {
      // 从QQ新闻数据结构中提取所需字段
      const {
        title,
        abstract,
        url,
        id,
        hotEvent,
        fimgUrl,
        uinnick,
        labelList,
      } = item;

      const tags = labelList.map((label) => label.word);

      // 构建返回数据
      const transformedItem: Pick<
        HotNews,
        | 'title'
        | 'url'
        | 'description'
        | 'image'
        | 'spiderId'
        | 'uniqueId'
        | 'hotCount'
        | 'tags'
      > = {
        title,
        description: abstract || title,
        image: fimgUrl?.['0'] || '',
        url,
        uniqueId: `qqnews-${id}`,
        spiderId,
        hotCount: hotEvent?.hotScore || 0,
        tags: Array.from(new Set([...tags, uinnick || '腾讯新闻'])),
      };

      return transformedItem;
    });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  // 获取腾讯新闻数据
  const rawData = await getData();

  // 确保result存在
  if (!rawData) {
    throw new Error('获取腾讯新闻数据失败');
  }

  const result = rawData?.idlist?.[0]?.newslist || [];

  if (!result) {
    throw new Error('获取腾讯新闻数据失败');
  }

  // 转换数据格式
  const transformedData = dataTransformer(result, id);

  // 检查并操作新闻数据
  await checkAndOperateNews(transformedData);

  // 更新爬虫更新时间
  await updateSpiderUpdateTime(id);

  return transformedData;
}
