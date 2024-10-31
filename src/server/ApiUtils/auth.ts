import validateCodeDao from "@/server/db/dao/validateCode.dao";
import type {SetHeaderOperation} from "@/server/middlewares";
import {MyNRError} from "@/utils/MyNRError";


export async function checkValidationCode(code: string, id: string):Promise<SetHeaderOperation | undefined> {
  // 验证验证码
  const validateCode = code;
  const sessionId = id;

  if (!validateCode || !sessionId) throw new MyNRError('Validate Code is incorrect', 400, {validateCode, sessionId});

  // 验证验证码是否正确
  const data = await validateCodeDao.getValidateCode({sessionId, validate: validateCode});

  if (!data) {
    throw new MyNRError('Validate Code is incorrect', 400, {validateCode, sessionId});
  } else {
    // remove the validate code
    await validateCodeDao.deleteValidateCode(String(data.id));
    // res.setHeader('Set-Cookie', `sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
    return {
      'Set-Cookie': 'sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;'
    }
  }
}


