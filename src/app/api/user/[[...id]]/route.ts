import {User} from "@prisma/client";
import userDao from "@/server/db/dao/user.dao";
import {NextRequest, NextResponse} from "next/server";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";
import {encryptPwdWithSalt} from "@/server/ApiUtils/encryption";
import {APIErrorHandler, MyNRError} from "@/utils/MyNRError";
import {Role} from "@/server/middlewares";
import * as Yup from "yup";

async function get(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  let id: string | undefined = undefined;
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  id = (await params).id;

  // get UserId and Role from 'x-user-id' and 'x-user-role' in headers
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  let data: Omit<User, 'password'>[] | Omit<User, 'password'> | null = null;

  // if user is not admin, only get user's own info


  if (userRole === Role.ADMIN) {
    if (id && !id?.includes('all')) {
      data = await userDao.getUserById(Number(id));
    } else if (query && id?.includes('all')) {
      data = await userDao.getUsers(query);
    } else {
      data = await userDao.getUserById(Number(userId));
    }
  } else if (userId) {
    data = await userDao.getUserById(Number(userId));
  } else {
    throw new MyNRError('需要登录，才能调用此接口哦', 403);
  }

  if (!data) throw new MyNRError('User Not Found', 404, {
    id, userId, userRole,
  });


  return NextResponse.json(data, {status: 200});
}


async function post(req: NextRequest) {
  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    // role 的取值范围是 Role 枚举中的值 1：USER 2：ADMIN 默认值是 1, 如果不传递则默认为 1
    role: Yup.string().oneOf([Role.USER, Role.ADMIN]).default(Role.USER),
    password2: Yup.string().required().equals([Yup.ref('password')]),
  });

  const data = await encryptPwdWithSalt(req) as Pick<User, 'name' | 'password' | 'email'> & {
    password2: string,
    validateCode: string
  };

  await schema.validate(data);

  // @ts-expect-error remove double-check data
  delete data.password2;
  // @ts-expect-error remove double-check data
  delete data.validateCode;

  const result = await userDao.createUser(data);
  return NextResponse.json(result, {status: 200});
}

async function put(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  try {
    const {id} = await params;
    const data = await readableStreamToJSON<Omit<User, 'id'>>(req.body);
    if (typeof data !== 'object') throw new MyNRError('无效数据', 401, {data});
    const result = await userDao.updateUser({...data, id: Number(id)});
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json(e, {status: 400});
  }
}


async function del(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const {id} = await params;
  if (!id) throw new MyNRError('无效的 id', 401, {id});
  const result = await userDao.deleteUser(id);
  return NextResponse.json(result, {status: 200});
}


export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
export const PUT = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, put);
export const DELETE = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, del);
