import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";
import VisitorDao from "@/server/db/dao/visitor.dao";
import {readableStreamToJSON} from "@/utils/readableStreamToJSON";

async function post(req: NextRequest) {
  const data = await readableStreamToJSON<{ fingerprint: string }>(req.body);
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '';

  if (typeof data !== 'string' && data.fingerprint) {
    await VisitorDao.updateOrCreate({
      browserSign: data.fingerprint,
      ip
    });
  }

  return NextResponse.json({
    message: 'ok'
  }, {status: 200});
}


export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
