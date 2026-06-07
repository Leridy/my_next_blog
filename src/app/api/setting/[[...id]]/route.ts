import { APIErrorHandler, MyNRError } from '@/utils/MyNRError';
import { NextRequest, NextResponse } from 'next/server';
import settingDao from '@/server/db/dao/setting.dao';
import { setting } from '@prisma/client';
import * as Yup from 'yup';
import { readableStreamToJSON } from '@/utils/readableStreamToJSON';

async function get(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  let data: setting[] | setting | null = null;
  const query = id ? { id: Number(id) } : Object.fromEntries(req.nextUrl.searchParams.entries());
  data = await settingDao.get(query);
  if (!data)
    throw new MyNRError('设置未找到', 404, {
      id,
      query,
    });
  return NextResponse.json(data, { status: 200 });
}

async function post(req: NextRequest) {
  const shema = Yup.object().shape({
    key: Yup.string().required(),
    value: Yup.string().required(),
    role: Yup.string().required(),
  });

  const data = await readableStreamToJSON<Omit<setting, 'id'>>(req.body);
  if (typeof data !== 'object') throw new MyNRError('无效数据', 401, { data });
  await shema.validate(data);
  const result = await settingDao.create(data);
  return NextResponse.json(result, { status: 200 });
}

async function put(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const schema = Yup.object().shape({
    key: Yup.string().required(),
    value: Yup.string().required(),
    role: Yup.string().required(),
  });
  const id = (await params).id;
  const data = await readableStreamToJSON<Omit<setting, 'id'>>(req.body);
  if (typeof data !== 'object') throw new MyNRError('无效数据', 401, { data });
  await schema.validate(data);
  const result = await settingDao.update(id, data);
  return NextResponse.json(result, { status: 200 });
}

async function del(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!id) throw new MyNRError('无效的 id', 401, { id });
  const result = await settingDao.del(id);
  return NextResponse.json(result, { status: 200 });
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
export const PUT = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, put);
export const DELETE = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, del);
