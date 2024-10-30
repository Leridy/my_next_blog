import type {NextApiRequest, NextApiResponse} from 'next'
import {createHot, deleteHot, getHots, updateHot} from "@/server/db/dao/hot.dao";
import {HotTopic} from "@prisma/client";
import {logger, Role, validationAuthToken} from "@/server/middlewares";


const get = async (query: Partial<HotTopic> | string): Promise<HotTopic[] | HotTopic | null> => {
  const queryObj = typeof query === 'string' ? {id: Number(query)} : query;
  return getHots(queryObj);
}

const post = async (req: NextApiRequest): Promise<HotTopic> => {
  const data = req.body;
  return createHot(data)
}

const put = async (id: string, data: Omit<HotTopic, 'newsList'>) => {
  return updateHot(id, data);
}

const del = async (id: string) => {
  return deleteHot(id);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let result;
  const id = req?.query?.id?.[0] || ''
  try {
    // get the query params
    switch (req.method) {
      case 'GET':
        // Get data from your database
        result = await get(req.query)
        break
      case 'POST':
        // Create a new record
        result = await post(req);
        break
      case 'PUT':
        // Update a record
        result = await put(id, req.body)
        break
      case 'DELETE':
        // Delete a record
        result = await del(id);
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json(e)
  }
}

export default logger(validationAuthToken(handler, {
  validateMethod: ['POST', 'PUT', 'DELETE'],
  role: Role.ADMIN
}));
