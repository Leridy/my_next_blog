import http from './http';
import { HotNews, HotSpider } from '@prisma/client';
import { checkAndOperateNews, spiderPublicLogic, updateSpiderUpdateTime } from '@/server/Spider/utils/spiderPublicLogic';
import getWereadID from '@/server/Spider/utils/getToken/weread';

interface WereadDataStructure {
  hints: string;
  readingCount: number;
  searchCount: number;
  type: number;
  bestMark: string;
  riseCount: number;
  searchIdx: number;
  bookInfo: {
    paperBook: {
      skuId: string;
    };
    title: string;
    soldout: number;
    mcardDiscount: number;
    ispub: number;
    extra_type: number;
    publishTime: string;
    lastChapterIdx: number;
    blockSaveImg: number;
    hideUpdateTime: boolean;
    author: string;
    payType: number;
    category: string;
    hasLecture: number;
    categories: {
      categoryId: number;
      subCategoryId: number;
      categoryType: number;
      title: string;
    }[];
    language: string;
    webBookControl: number;
    newRating: number;
    format: string;
    originalPrice: number;
    listenCount: number;
    selfProduceIncentive: boolean;
    bookId: string;
    bookStatus: number;
    copyrightChapterUids: number[];
    newRatingDetail: {
      title: string;
    };
    cover: string;
    version: number;
    type: number;
    price: number;
    cpid: number;
    isEPUBComics: number;
    finished: number;
    free: number;
    intro: string;
    centPrice: number;
    newRatingCount: number;
  };
}

const SPIDER_INFO: Pick<HotSpider, 'name' | 'description'> = {
  name: 'weread',
  description: 'weread 爬虫',
};

const URL_GENERATOR = () => `https://weread.qq.com/web/bookListInCategory/rising?rank=1`;

async function getData(): Promise<{ books: WereadDataStructure[] }> {
  const url = URL_GENERATOR();
  return await http.get(url, {});
}

function dataTransformer(data: WereadDataStructure[], spiderId: number): Pick<HotNews, 'title' | 'url' | 'description' | 'image' | 'spiderId' | 'uniqueId'>[] {
  return data.map((item) => {
    const {
      bookInfo: { author, category, title, intro, cover, bookId, newRatingDetail = { title: undefined } },
      readingCount = 0,
      searchCount = 0,
    } = item;
    return {
      title,
      description: intro,
      image: cover,
      url: `https://weread.qq.com/web/bookDetail/${getWereadID(bookId)}`,
      uniqueId: `weread-${bookId}`,
      spiderId,
      hotCount: readingCount + searchCount || 0,
      tags: [newRatingDetail.title, author, category].filter(Boolean),
    };
  });
}

/**
 * main logic of getData from weread
 */
export default async function main() {
  const { id } = await spiderPublicLogic(SPIDER_INFO);

  const requestedData = await getData();
  const result = requestedData.books;

  const transformedData = dataTransformer(result, id);

  // data transform to your own format
  await checkAndOperateNews(transformedData);
  // update spider update time
  await updateSpiderUpdateTime(id);

  return transformedData;
}
