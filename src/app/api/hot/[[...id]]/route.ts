import {createHot, deleteHot, getHots, updateHot} from "@/server/db/dao/hot.dao";
import {HotTopic} from "@prisma/client";
import * as Yup from 'yup';
import {NextRequest, NextResponse} from "next/server";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";
import {getIdFromPath} from "@/utils/getIdFromPath";
import {MyNRError} from "@/utils/MyNRError";


/**
 * Refactor the code above as
 * export const GET|POST|PUT|DELETE = handler;
 */
export const GET = async (req: NextRequest) => {
  try {
    const pathname = req.nextUrl.pathname;
    const originQuery = req.nextUrl.searchParams as Partial<Omit<HotTopic, 'newsList'>>
    const id = getIdFromPath(pathname);
    let data: HotTopic[] | HotTopic | null = null;
    const query = id ? {id: Number(id)} : originQuery;
    data = await getHots(query);
    return NextResponse.json(data, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {status: e.statusCode});
    }
    return NextResponse.json(e, {status: 400});
  }

}

export async function POST(req: NextRequest) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })
  try {

    const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
    if (typeof data !== 'object') throw new MyNRError('Invalid data', 401, {data});
    await schema.validateSync(data);
    const result = await createHot(data);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {status: e.statusCode});
    }
    return NextResponse.json(e, {status: 400});
  }
}

export async function PUT(req: NextRequest) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })
  try {
    const pathname = req.nextUrl.pathname;
    const id = getIdFromPath(pathname);
    const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
    if (typeof data !== 'object') throw new MyNRError('Invalid data', 401, {data});
    await schema.validateSync(data);
    if (!id) throw new MyNRError('Invalid id', 401, {id, request: {body: data, pathname}});
    const result = await updateHot(id, data);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {status: e.statusCode});
    } else {
      return NextResponse.json(e, {status: 400});
    }
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const id = getIdFromPath(pathname);
    if (!id) throw new MyNRError('Invalid id', 401, {id, request: {pathname}});
    const result = await deleteHot(id);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {
        status: e.statusCode
      });

    }
    return NextResponse.json(e, {status: 400});
  }
}

