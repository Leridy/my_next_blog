import {createHot, deleteHot, getHots, updateHot} from "@/server/db/dao/hot.dao";
import {HotTopic} from "@prisma/client";
import * as Yup from 'yup';
import {NextRequest, NextResponse} from "next/server";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";
import {APIErrorHandler, MyNRError} from "@/utils/MyNRError";


async function get(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const originQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
  const id = (await params).id
  let data: HotTopic[] | HotTopic | null = null;
  const query = id ? {id: Number(id)} : originQuery;
  data = await getHots(query);

  if (!data) throw new MyNRError('Hot Not Found', 404, {
    id, query,
  });
  return NextResponse.json(data, {status: 200});
}


async function post(req: NextRequest) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })


  const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
  if (typeof data !== 'object') throw new MyNRError('Invalid data', 401, {data});
  await schema.validateSync(data);
  const result = await createHot(data);
  return NextResponse.json(result, {status: 200});
}

async function put(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })
  const pathname = req.nextUrl.pathname;
  const id = (await params).id;
  const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
  if (typeof data !== 'object') throw new MyNRError('Invalid data', 401, {data});
  await schema.validateSync(data);
  if (!id) throw new MyNRError('Invalid id', 401, {id, request: {body: data, pathname}});
  const result = await updateHot(id, data);
  return NextResponse.json(result, {status: 200});
}

async function del(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const pathname = req.nextUrl.pathname;
  const id = (await params).id;
  if (!id) throw new MyNRError('Invalid id', 401, {id, request: {pathname}});
  const result = await deleteHot(id);
  return NextResponse.json(result, {status: 200});
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
export const PUT = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, put);
export const DELETE = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, del);


