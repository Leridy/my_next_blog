import {NextApiRequest, NextApiResponse} from "next";
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import {User} from "@prisma/client";
import userDao from "@/server/db/dao/user.dao";
import {checkValidationCode, SetHeaderOperation} from "@/server/ApiUtils/auth";
import env from "../../../../../.project.json";
import {mergeHeaderObj} from "../../../../../utils/mergeObject";
import {NextRequest, NextResponse} from "next/server";


const login = async (data: Pick<User, 'email' | 'password'>) => {
  return userDao.login(data);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({message: 'Method Not Allowed', allowedMethods: ['POST'],});

  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    validateCode: Yup.string().required(),
  });


  try {
    await schema.validate(req.body);
    const validateResult = await checkValidationCode(req);
    const result = await login(req.body);
    console.log(result, req.body);
    if (!result) throw new Error('User not found');


    const returnResult = {...result} as Partial<User>

    delete returnResult.password;

    // use jwt to generate token
    const token = jwt.sign(returnResult, env.JWT_TOKEN_SECRET, {expiresIn: '30d'});


    resHeaderOperation['Set-Cookie'] = `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60};`;

    if (validateResult) {
      resHeaderOperation = mergeHeaderObj(resHeaderOperation, validateResult);
    }

    console.log(resHeaderOperation);

    Object.keys(resHeaderOperation).forEach(key => {
      res.setHeader(key, resHeaderOperation[key]);
    });

    res.status(200).json({access_token: token});
  } catch (e) {
    res.status(400).json({message: (e as Error).message});
    return;
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({message: 'hello'}, {status: 200});
}
