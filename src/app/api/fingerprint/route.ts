import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import VisitorDao from "@/server/db/dao/visitor.dao";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";

async function post(req: NextRequest) {
  const data = await readableStreamToJSON<{ fingerprint: string }>(req.body);

  if (typeof data !== 'string' && data.fingerprint) {
    await VisitorDao.updateOrCreate({
      browserSign: data.fingerprint
    });
  }

  return NextResponse.json({
    message: 'ok'
  }, {status: 200});
}


export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
