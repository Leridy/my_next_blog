import {NextApiRequest, NextApiResponse} from "next";
import * as Yup from 'yup';
import userDao from "@/server/db/dao/user.dao";
import jwt from "jsonwebtoken";
import env from "../../../../.project.json";
import {User} from "@prisma/client";
import {checkValidationCode, Role, SetHeaderOperation} from "@/server/ApiUtils/auth";
import {mergeHeaderObj} from "../../../../utils/mergeObject";



async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({message: 'Method Not Allowed', allowedMethods: ['POST'],});

  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    name: Yup.string().required(),
    password2: Yup.string().required().equals([Yup.ref('password')]),
    validateCode: Yup.string().required(),
  });

  try {
    await schema.validate(req.body);
    const headerOperations = await checkValidationCode(req);
    delete req.body.password2;
    delete req.body.validateCode;
    req.body.role = Role.USER;
    const result = await userDao.createUser(req.body);
    const returnResult = {...result} as Partial<User>

    delete returnResult.password;

    // use jwt to generate token
    const token = jwt.sign(returnResult, env.JWT_TOKEN_SECRET, {expiresIn: '30d'});

    if (headerOperations) {
      resHeaderOperation = mergeHeaderObj({
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60};`
      }, headerOperations)
    }

    Object.keys(resHeaderOperation).forEach(key => {
      res.setHeader(key, resHeaderOperation[key]);
    });

    res.status(200).json({access_token: token});
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
    return;
  }
}

export default handler;
