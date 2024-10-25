import type {NextApiRequest, NextApiResponse} from 'next'
import {getAllHot} from "@/server/db/dao/hot.dao";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await getAllHot();
    res.json(result);
  } catch (e) {
    res.status(500).json(e);
  }
}
