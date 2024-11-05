import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import Spider from "@/server/Spider";

/**
 * handle GET /api/spider route
 * @description 因为 Spider 的注册是由代码自动完成的，所以不需要提供创建、更新、删除的接口，这里只需要提供列表和详情接口
 */
async function get() {


  const result = await Spider();

  return NextResponse.json(result, {status: 200});
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
