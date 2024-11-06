import {NextRequest, NextResponse} from "next/server";
import {User} from "@prisma/client";
import * as Yup from 'yup';
import userDao from "@/server/db/dao/user.dao";
import {Role, SetHeaderOperation} from "@/server/middlewares";
import {checkValidationCode, encryptPwdWithSalt} from "@/server/ApiUtils";
import {mergeHeaderObj} from "@/utils/mergeObject";
import {APIErrorHandler} from "@/utils/MyNRError";

async function post(req: NextRequest) {
  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    validateCode: Yup.string().required(),
    // role 的取值范围是 Role 枚举中的值 1：USER 2：ADMIN 默认值是 1, 如果不传递则默认为 1
    role: Yup.string().oneOf([Role.USER, Role.ADMIN]).default(Role.USER),
    password2: Yup.string().required().equals([Yup.ref('password')]),
  });

  const data = await encryptPwdWithSalt(req) as Pick<User, 'name' | 'password' | 'email' | 'role'> & {
    password2: string,
    validateCode: string
  }
  await schema.validate(data);

  const sessionId = req.cookies.get('sessionId')?.value || '';
  const validateResult = await checkValidationCode(data.validateCode, sessionId);

  const dataToCreate: Partial<typeof data> = {...data};
  // remove double-check data
  delete dataToCreate.password2;
  delete dataToCreate.validateCode;

  // add User role
  dataToCreate.role = Role.USER;

  const result = await userDao.createUser(dataToCreate as User);

  // remove password field
  delete result.password;

  if (validateResult) resHeaderOperation = mergeHeaderObj(resHeaderOperation, validateResult);

  return NextResponse.json(result, {status: 200, headers: resHeaderOperation as Record<string, string>});
}

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
