import type {NextApiRequest, NextApiResponse} from 'next'
import {HotTopic} from "@prisma/client";
import {validationAuthToken, logger} from "@/server/middleware";


const get = async (query: Partial<HotTopic> | string):Promise<HotTopic[] | HotTopic | null> => {
  const queryObj = typeof query === 'string' ? {id: Number(query)} : query;
  return [];
}

const post = async (data: Omit<HotTopic, 'id' | 'newsList'>) => {
  return null;
}

const put = async (id:string, data: Omit<HotTopic, 'newsList'>) => {
  return null;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let result;
  try {
    // get the query params
    switch (req.method) {
      case 'GET':
        // Get data from your database
        result = await get(req.query)
        break
      case 'POST':
        // Create a new record
        result = await post(req.body)
        break
      case 'PUT':
        // Update a record
        const id = req?.query?.id?.[0] || ''
        result = await put(id ,  req.body)
        break
      case 'DELETE':
        // Delete a record
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    res.status(200).json(result);
  } catch (e) {
    console.log(e)
    res.status(500).json(e)
  }
}

export default logger(validationAuthToken(handler, []));
