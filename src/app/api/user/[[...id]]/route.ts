import {User} from "@prisma/client";
import userDao from "@/server/db/dao/user.dao";
import {NextRequest, NextResponse} from "next/server";
import {getIdFromPath} from "@/utils/getIdFromPath";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";
import {encryptPwdWithSalt} from "@/server/ApiUtils/encryption";
import {MyNRError} from "@/utils/MyNRError";

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const id = getIdFromPath(pathname);
    let data: User[] | User | null = null;
    const query = req.nextUrl.searchParams as Partial<User>;

    if (id) {
      data = await userDao.getUserById(Number(id));
    } else {
      data = await userDao.getUsers(query);
    }

    return NextResponse.json(data, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {status: e.statusCode});
    }
    return NextResponse.json(e, {status: 400});
  }

}


export async function POST(req: NextRequest) {
  try {
    const data = await encryptPwdWithSalt(req) as Pick<User, 'name' | 'password' | 'email'> & {
      password2: string,
      validateCode: string
    };
    const result = await userDao.createUser(data);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    if (e instanceof MyNRError) {
      return NextResponse.json({message: e.message, errorDetail: e.getData()}, {status: e.statusCode});
    }
    return NextResponse.json(e, {status: 400});
  }
}

export async function PUT(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const id = getIdFromPath(pathname);
    const data = await readableStreamToJSON<Omit<User, 'id'>>(req.body);
    if (typeof data !== 'object') throw new MyNRError('Invalid data', 401, {data});
    const result = await userDao.updateUser({...data, id: Number(id)});
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json(e, {status: 400});
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const id = getIdFromPath(pathname);
    if (!id) throw new MyNRError('Invalid id', 401, {id, request: {pathname}});
    const result = await userDao.deleteUser(id);
    return NextResponse.json(result, {status: 200});
  } catch (e) {
    return NextResponse.json(e, {status: 400});
  }
}
