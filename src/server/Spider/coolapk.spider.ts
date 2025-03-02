import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import {
  checkAndOperateNews,
  spiderPublicLogic,
  updateSpiderUpdateTime,
} from '@/server/Spider/utils/spiderPublicLogic';
import { genHeaders } from '@/server/Spider/utils/getToken/coolapk';

interface CoolApkDataStructure {
  id: number;
  type: number;
  fid: number;
  forwardid: string;
  source_id: string;
  uid: number;
  username: string;
  dyh_id: number;
  dyh_name: string;
  ttype: number;
  tcat: number;
  tid: number;
  ttitle: string;
  tpic: string;
  turl: string;
  tinfo: string;
  message_title: string;
  message_title_md5: string;
  message_keywords: string;
  message_cover: string;
  message: string;
  pic: string;
  message_length: number;
  issummary: number;
  istag: number;
  is_html_article: number;
  tags: string;
  label: string;
  user_tags: string;
  media_type: number;
  media_pic: string;
  media_url: string;
  extra_type: number;
  extra_key: string;
  extra_title: string;
  extra_url: string;
  extra_pic: string;
  extra_info: string;
  extra_status: number;
  location: string;
  fromid: number;
  fromname: string;
  likenum: number;
  burynum: number;
  commentnum: number;
  replynum: number;
  forwardnum: number;
  reportnum: number;
  relatednum: number;
  favnum: number;
  share_num: number;
  comment_block_num: number;
  question_answer_num: number;
  question_follow_num: number;
  hitnum: number;
  viewnum: number;
  feed_score: number;
  rank_score: number;
  vote_score: number;
  at_count: number;
  url_count: number;
  tag_count: number;
  change_count: number;
  recommend: number;
  is_anonymous: number;
  is_hidden: number;
  is_headline: number;
  disallow_reply: number;
  status: number;
  block_status: number;
  message_status: number;
  publish_status: number;
  dateline: number;
  lastupdate: number;
  create_time: number;
  last_change_time: number;
  device_title: string;
  device_name: string;
  device_rom: string;
  device_build: string;
  recent_reply_ids: string;
  recent_hot_reply_ids: string;
  recent_like_list: string;
  related_dyh_ids: string;
  post_signature: string;
  message_signature: string;
  fetchType: string;
  entityId: number;
  avatarFetchType: string;
  userAvatar: string;
  is_pre_recommended: number;
  entityTemplate: string;
  entityType: string;
  url: string;
  feedType: string;
  feedTypeName: string;
  turlTarget: string;
  isModified: number;
  enableModify: number;
  info: string;
  infoHtml: string;
  title: string;
  picArr: string[];
  device_title_url: string;
  relateddata: never[];
  media_info: string;
  sourceFeed: never;
  forwardSourceType: string;
  shareUrl: string;
  extra_fromApi: string;
  canDisallowReply: number;
  long_location: string;
  is_white_feed: number;
  editor_title: string;
  include_goods_ids: string[];
  top_reply_ids: string[];
  is_ks_doc: number;
  replyRows: never[];
  replyRowsCount: number;
  replyRowsMore: number;
  userInfo: {
    uid: number;
    username: string;
    admintype: number;
    groupid: number;
    usergroupid: number;
    level: number;
    experience: number;
    status: number;
    block_status: number;
    usernamestatus: number;
    avatarstatus: number;
    avatar_cover_status: number;
    regdate: number;
    logintime: number;
    verify_title: string;
    verify_status: number;
    user_type: number;
    verify_show_type: number;
    avatar_plugin_status: number;
    fetchType: string;
    entityType: string;
    entityId: number;
    displayUsername: string;
    url: string;
    userAvatar: string;
    userSmallAvatar: string;
    userBigAvatar: string;
    cover: string;
    verify_icon: string;
    verify_label: string;
    isDeveloper: number;
    next_level_experience: number;
    next_level_percentage: string;
    level_today_message: string;
    level_detail_url: string;
    avatar_plugin_url: string;
    feed_plugin_url: string;
    feed_plugin_open_url: string;
    feed_reply_plugin: string;
    feed_reply_plugin_open_url: string;
  };

  relationRows: {
    id: number;
    logo: string;
    title: string;
    url: string;
    entityType: string;
    relation_addition_logo: string;
    relation_addition_title: string;
  }[];
  targetRow: {
    id: number;
    logo: string;
    title: string;
    url: string;
    entityType: string;
    star_total_count: number;
    star_average_score: number;
    isFollow: number;
    targetType: string;
    relation_addition_logo: string;
    relation_addition_title: string;
    subTitle: string;
  };
  _tid: number;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'coolapk',
  description: 'coolapk 爬虫',
};

const URL_GENERATOR = () =>
  `https://api.coolapk.com/v6/page/dataList?url=/feed/statList?cacheExpires=300&statType=day&sortField=detailnum&title=今日热门&title=今日热门&subTitle=&page=1`;

async function getData(): Promise<{ data: CoolApkDataStructure[] }> {
  const url = URL_GENERATOR();
  return await http.get(url, {
    headers: await genHeaders(),
  });
}

function dataTransformer(
  data: CoolApkDataStructure[],
  spiderId: number
): Pick<
  HotNews,
  'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'
>[] {
  return data.map((item) => {
    const {
      id,
      message: title,
      ttitle: description,
      tpic: image,
      shareUrl: url,
      likenum: hotCount,
      tags,
    } = item;
    return {
      title,
      description,
      image,
      url,
      uniqueId: `coolapk-${id}`,
      spiderId,
      hotCount,
      // tags should remove # and split by ','
      tags: tags?.replace(/#/g, '').split(','),
    };
  });
}

/**
 * main logic of getData from huxiu
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();

  const result = requestedData.data;
  //
  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
