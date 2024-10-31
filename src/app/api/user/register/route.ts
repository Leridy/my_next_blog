import * as Yup from 'yup';
import userDao from "@/server/db/dao/user.dao";
import {User} from "@prisma/client";
import {checkValidationCode} from "@/server/ApiUtils/auth";
import {Role, SetHeaderOperation} from "@/server/middlewares";
import {NextRequest, NextResponse} from "next/server";
import {encryptPwdWithSalt} from "@/server/ApiUtils/encryption";
import {mergeHeaderObj} from "../../../../../utils/mergeObject";
export async function POST(req: NextRequest) {
  let resHeaderOperation: SetHeaderOperation = {};

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    validateCode: Yup.string().required(),
    // role 的取值范围是 Role 枚举中的值 1：USER 2：ADMIN 默认值是 1, 如果不传递则默认为 1
    role: Yup.string().oneOf([Role.USER, Role.ADMIN]).default(Role.USER),
    password2: Yup.string().required().equals([Yup.ref('password')]),
  });

  try {
    const data = await encryptPwdWithSalt(req) as Pick<User, 'name' | 'password' | 'email' | 'role'> & {
      password2: string,
      validateCode: string
    }
    await schema.validate(data);

    console.log(data);

    const sessionId = req.cookies.get('sessionId')?.value || '';
    const validateResult = await checkValidationCode(data.validateCode, sessionId);

    const dataToCreate: Partial<typeof data> = {...data} ;
    // remove double-check data
    delete dataToCreate.password2;
    delete dataToCreate.validateCode;

    // add User role
    dataToCreate.role = Role.USER;

    const result = await userDao.createUser(dataToCreate as User);

    // remove password field
    delete result.password;

    if(validateResult) resHeaderOperation = mergeHeaderObj(resHeaderOperation, validateResult);

    return NextResponse.json(result, {status: 200, headers: resHeaderOperation as Record<string, string>});
  } catch (e) {
    console.log(e);
    return NextResponse.json({message: (e as Error).message}, {status: 401});
  }
}
