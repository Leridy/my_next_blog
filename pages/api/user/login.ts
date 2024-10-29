import {NextApiRequest, NextApiResponse} from "next";
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import {User} from "@prisma/client";
import userDao from "@/server/db/dao/user.dao";
import {checkValidationCode, encryptWithSalt, logger} from "@/server/middlewares";
import env from "../../../.project.json";


const login = async (data: Pick<User, 'email' | 'password'>) => {
  return userDao.login(data);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({message: 'Method Not Allowed', allowedMethods: ['POST'],});

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
  });

  try {
    await schema.validate(req.body);
    const result = await login(req.body);
    if (!result) res.status(404).json({message: 'User not exist or password incorrect'});

    const returnResult = {...result}
    delete returnResult.password;

    // use jwt to generate token
    const token = jwt.sign(returnResult, env.JWT_TOKEN_SECRET, {expiresIn: '30d'});
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60};`);
    res.status(200).json({access_token: token});
  } catch (e) {
    res.status(400).json(e);
    return;
  }
}

export default encryptWithSalt(logger(checkValidationCode(handler)));
