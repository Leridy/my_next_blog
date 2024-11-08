import http from "./http";
import {HotNews, HotSpider} from "@prisma/client";
import {checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime} from "@/server/Spider/utils/spiderPublicLogic";


interface ToutiaoDataStructure {
  ClusterId: number;
  Title: string;
  LabelUrl: string;
  Label: string;
  Url: string;
  HotValue: number;
  Schema: string;
  LabelUri: {
    uri: string;
    url: string;
    width: number;
    height: number;
    url_list: { url: string }[]
    image_type: number;
  }
  ClusterIdStr: string;
  ClusterType: number;
  QueryWord: string;
  Image: {
    uri: string;
    url: string;
    width: number;
    height: number;
    url_list: { url: string }[]
    image_type: number;
  }
  LabelDesc: string;
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'toutiao',
  description: 'toutiao 爬虫',
}

const URL_GENERATOR = () => `https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc`;


async function getData(): Promise<{data:ToutiaoDataStructure[]}> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: ToutiaoDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    return {
      title: item.Title,
      description: item.QueryWord,
      image: item.Image.url,
      url: item.Url,
      uniqueId: `toutiao-${item.ClusterId}`,
      spiderId,
      hotCount: Number(item.HotValue),
      tags: [item.LabelDesc || item.Label]
    }
  });
}


/**
 * main logic of getData from 36kr
 */
export default async function main() {
  const {id} = await spiderPublicLogic(SPIDER_INFO);


  const requestedData = await getData();

  //
  // const result = mergeTypeData(requestedData)
  // //
  const transformedData = dataTransformer(requestedData.data, id);
  //
  //
  // // data transform to your own format
  await checkAndOperateNews(transformedData);
  // // update spider update time
  await updateSpiderUpdateTime(id);


  return transformedData;
}


