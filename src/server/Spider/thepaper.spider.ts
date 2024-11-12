import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";

interface ThePaperDataStructure {
  contId: string;
  isOutForword: string;
  isOutForward: string;
  forwardType: string;
  mobForwardType: number;
  interactionNum: string;
  praiseTimes: string;
  pic: string;
  imgCardMode: number;
  smallPic: string;
  sharePic: string;
  pubTime: string;
  pubTimeNew: string;
  name: string;
  closePraise: string;
  waterMark: {
    type: string;
    value: string;
    bigPicValue: string;
    videoSize: string;
  }
  nodeInfo: {
    nodeId: number;
    name: string;
    desc: string;
    pic: string;
    nodeType: number;
    channelType: number;
    forwordType: number;
    forwardType: string;
    liveType: string;
    parentId: number;
    isOrder: string;
    dataType: string;
    shareName: string;
    nickName: string;
    mobForwardType: string;
    summarize: string;
    color: string;
    videoLivingRoomDes: string;
    wwwSpecNodeAlign: number;
    govAffairsType: string;
    showSpecialBanner: boolean;
    showSpecialTopDesc: boolean;
    topBarTypeCustomColor: boolean;
    showVideoBottomRightBtn: boolean;
  }
  videos: {
    videoId: string;
    hdurl: string;
    url: string;
    duration: string;
    coverUrl: string;
    verticalCoverUrl: string;
    bytes: string;
    hdBytes: string;
    coverUrlFirstFrame: string;
    verticalVideo: boolean;
    durationNum: number;
    videoDes: string;
    playInfos: string;
    outLink: boolean;
  }
  nodeId: number;
  contType: number;
  pubTimeLong: number;
  specialNodeId: number;
  cardMode: string;
  dataObjId: number;
  closeFrontComment: boolean;
  isSupInteraction: boolean;
  tagList: {
    tagId: number;
    tag: string;
    isOrder: string;
    isUpdateNotify: string;
    isWonderfulComments: string;
  }[];
  hideVideoFlag: boolean;
  praiseStyle: number;
  isSustainedFly: number;
  softLocType: number;
  closeComment: boolean;
  voiceInfo: {
    imgSrc: string;
    isHaveVoice: string;
  }
  softAdTypeStr: string;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'pengpai',
  description: 'pengpai 爬虫',
}

const URL_GENERATOR = () => `https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar`


async function getData(): Promise<{ data: { hotNews: ThePaperDataStructure[] } }> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: ThePaperDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.name,
      description: item.name,
      image: item.pic || '',
      url: `https://www.thepaper.cn/newsDetail_forward_${item.contId}`,
      uniqueId: `thepepar-${item.contId}`,
      spiderId,
      hotCount: Number(item.interactionNum) || 0,
      tags: item.tagList.map(tag => tag.tag)
    }
  });
}

/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();

  const result = requestedData.data.hotNews;

  const transformedData = dataTransformer(result, id);


  // data transform to your own format
  await checkAndOperateNews(transformedData);

  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}


