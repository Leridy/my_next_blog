import {NextRequest, NextResponse} from "next/server";
import {User} from "@prisma/client";
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import userDao from "@/server/db/dao/user.dao";
import {checkValidationCode} from "@/server/ApiUtils/auth";
import {SetHeaderOperation} from "@/server/middlewares";
import {encryptPwdWithSalt} from "@/server/ApiUtils/encryption";
import {mergeHeaderObj} from "@/utils/mergeObject";
import env from "../../../../../.project.json";


const login = async (data: Pick<User, 'email' | 'password'>) => {
  return userDao.login(data);
}

export async function POST(req: NextRequest) {
  // the refactor logic code above into this function you should remember the req is a NextRequest object,
  // and you should return a NextResponse object.

  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    validateCode: Yup.string().required(),
  });

  try {
    const data = await encryptPwdWithSalt(req) as Pick<User, 'email' | 'password'> & {validateCode: string};

    const sessionId = req.cookies.get('sessionId')?.value || '';
    await schema.validate(data);
    const validateResult = await checkValidationCode(data.validateCode, sessionId);
    const result = await login(data);
    if (!result) throw new Error('User not found');

    const returnResult = {...result} as Partial<User>
    delete returnResult.password;

    const token = jwt.sign(returnResult, env.JWT_TOKEN_SECRET, {expiresIn: '30d'});
    resHeaderOperation['Set-Cookie'] = `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60};`;


    if (validateResult) {
      resHeaderOperation = mergeHeaderObj(resHeaderOperation, validateResult);
    }

    return NextResponse.json({access_token: token}, {status: 200, headers: resHeaderOperation as Record<string, string>});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 400});
  }

}
