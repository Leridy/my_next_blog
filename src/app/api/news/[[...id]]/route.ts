import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler, MyNRError} from "@/utils/MyNRError";
import * as Yup from 'yup';
import {HotNews} from "@prisma/client";
import NewsDao from "@/server/db/dao/news.dao";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";
import {OrderBy, OrderByApiQuery, Page, PageApiQuery, PageDataBaseQuery} from "@/server/db/dao/type";

const schema = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  // url should be a valid url
  url: Yup.string().url().required(),
  spiderId: Yup.number().required(),
})

/**
 * /api/news route
 * @description 因为 news 是 Spider 自动创建的
 */
async function get(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const originQuery = Object.fromEntries(req.nextUrl.searchParams.entries()) as unknown as Pick<HotNews, 'title' | 'description' | 'spiderId'> & Partial<PageApiQuery & OrderByApiQuery>;
  if (originQuery.spiderId) originQuery.spiderId = Number(originQuery.spiderId);
  const id = (await params).id
  let data: HotNews[] | HotNews | Page<HotNews> | null = null;
  let pageQuery: PageDataBaseQuery | undefined = undefined;
  let orderRule: OrderBy |undefined = undefined;

  if (originQuery?.page && originQuery?.pageSize) {
    pageQuery = {
      skip: Number((originQuery.page - 1) * originQuery.pageSize),
      take: Number(originQuery.pageSize)
    }
    delete originQuery.page;
    delete originQuery.pageSize;
  }

  if (originQuery.key && originQuery.order) {
    orderRule = {};
    orderRule[originQuery.key] = originQuery.order;
    delete originQuery.key;
    delete originQuery.order;
  }

  const query = id ? Number(id) : {...originQuery};


  data = await NewsDao.get(query, pageQuery, orderRule);


  if (!data) throw new MyNRError('你寻找的热门栏目不存在', 404, {
    id, query,
  });

  let dataWithPage: Page<HotNews> | undefined = undefined;

  if (pageQuery && typeof query !== 'number' && Array.isArray(data)) {
    const total = await NewsDao.getTotalCount(query);
    dataWithPage = {
      data,
      page: {
        page: pageQuery.skip / pageQuery.take + 1,
        pageSize: pageQuery.take,
        total
      }
    }
  }

  return NextResponse.json(dataWithPage || data, {status: 200});
}

async function post(req: NextRequest) {
  const data = await readableStreamToJSON<Pick<HotNews, 'title' | 'description' | 'url' | 'spiderId' | 'uniqueId'>>(req.body);
  await schema.validate(data);
  if (typeof data !== 'object') throw new MyNRError('无效数据', 401, {data});
  const result = await NewsDao.create(data);

  return NextResponse.json(result, {status: 200});
}

async function update(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const data = await readableStreamToJSON<Pick<HotNews, | 'title' | 'description' | 'url'>>(req.body);
  await schema.validate(data);
  if (typeof data !== 'object') throw new MyNRError('无效数据', 401, {data});
  const result = await NewsDao.update(Number(id), data);

  return NextResponse.json(result, {status: 200});
}

async function del(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const result = await NewsDao.delete({id: Number(id)});

  return NextResponse.json(result, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
export const PUT = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, update);
export const DELETE = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, del);
