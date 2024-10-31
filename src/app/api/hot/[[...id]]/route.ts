import {createHot, deleteHot, getHots, updateHot} from "@/server/db/dao/hot.dao";
import {HotTopic} from "@prisma/client";
import * as Yup from 'yup';
import {Role, validationAuthToken} from "@/server/ApiUtils/auth";
import {NextRequest, NextResponse} from "next/server";
import {readableStreamToJSON} from "../../../../../utils/readableStreamToJSON";


// const get = async (query: Partial<HotTopic> | string): Promise<HotTopic[] | HotTopic | null> => {
//   const queryObj = typeof query === 'string' ? {id: Number(query)} : query;
//   return getHots(queryObj);
// }
//
// const post = async (req: NextApiRequest): Promise<HotTopic> => {
//   const data = req.body;
//   return createHot(data)
// }
//
// const put = async (id: string, data: Omit<HotTopic, 'newsList'>) => {
//   return updateHot(id, data);
// }
//
// const del = async (id: string) => {
//   return deleteHot(id);
// }
//
// async function handler(req: NextRequest) {
//   let result;
//   const id = req?.query?.id?.[0] || ''
//
//   try {
//
//     await validationAuthToken(req, {
//       validateMethod: [ 'POST', 'PUT', 'DELETE'],
//       role: Role.ADMIN
//     });
//
//     // get the query params
//     switch (req.method) {
//       case 'GET':
//         // Get data from your database
//         result = await get(req.query)
//         break
//       case 'POST':
//         // Create a new record
//         result = await post(req);
//         break
//       case 'PUT':
//         // Update a record
//         result = await put(id, req.body)
//         break
//       case 'DELETE':
//         // Delete a record
//         result = await del(id);
//         break
//       default:
//         res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
//
//     res.status(200).json(result);
//     return res;
//   } catch (e) {
//     res.status(401).json({message: (e as Error).message});
//     return res;
//   }
// }

const getId = (pathname: string) => {
  return pathname.split('/').pop();
}

/**
 * Refactor the code above as
 * export const GET|POST|PUT|DELETE = handler;
 */
export const GET = async (req: NextRequest) => {
  try {
    await validationAuthToken(req, {role: Role.ADMIN});
    const pathname = req.nextUrl.pathname;
    const originQuery = req.nextUrl.searchParams as Partial<Omit<HotTopic, 'newsList'>>
    const id = getId(pathname);
    let data: HotTopic[] | HotTopic | null = null;
    const query = id ? {id: Number(id)} : originQuery;
    data = await getHots(query);
    return NextResponse.json(data, {status: 200});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 401});
  }

}

export async function POST(req: NextRequest) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })
  try {

    const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
    if (typeof data !== 'object') throw new Error('Invalid data');
    await schema.validateSync(data);
    const result = await createHot(data);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 401});
  }
}

export async function PUT(req: NextRequest) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    url: Yup.string().required(),
  })
  try {
    const pathname = req.nextUrl.pathname;
    const id = getId(pathname);
    const data = await readableStreamToJSON<Omit<HotTopic, 'newsList' | 'id'>>(req.body);
    if (typeof data !== 'object') throw new Error('Invalid data');
    await schema.validateSync(data);
    const result = await updateHot(id, data);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 401});
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const id = getId(pathname);
    if (!id) throw new Error('Invalid id');
    const result = await deleteHot(id);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 401});
  }
}

