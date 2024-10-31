import type {NextApiRequest, NextApiResponse} from 'next'
import {User} from "@prisma/client";
import userDao from "@/server/db/dao/user.dao";
import {Role, validationAuthToken} from "@/server/ApiUtils/auth";


const get = async (query: Partial<User> | string): Promise<User[] | User | null> => {
  const queryObj = typeof query === 'string' ? {id: Number(query)} : query;
  if (queryObj.id) {
    return userDao.getUserById(queryObj.id)
  }
  return userDao.getUsers(queryObj);
}

const post = async (data: User) => {
  return userDao.createUser(data);
}

const put = async (id: string, data: User) => {
  return userDao.updateUser({...data, id: Number(id)})
}

const remove = async (id: string) => {
  return userDao.deleteUser(id);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let result;
  const id = req?.query?.id?.[0] || ''

  // validationAuthToken(req, {
  //   validateMethod: ['GET', 'POST', 'PUT', 'DELETE'],
  //   role: Role.ADMIN
  // })

  try {
    // get the query params
    switch (req.method) {
      case 'GET':
        // Get data from your database
        result = await get(req.query)
        break
      case 'POST':
        // Create a new record
        result = await post(req.body);
        break
      case 'PUT':
        // Update a record
        result = await put(id, req.body)
        break
      case 'DELETE':
        // Delete a record
        result = await remove(id)
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

export default handler;
