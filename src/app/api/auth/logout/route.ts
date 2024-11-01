import {NextRequest, NextResponse} from "next/server";
import {APIErrorHandler} from "@/utils/MyNRError";

/**
 * logout should do the following:
 * 1. request to server remove the token in the cookie
 */
async function post() {

  // remove the token in the cookie
  return NextResponse.json({message: 'logout success'}, {
    status: 200,
    headers: {
      'Set-Cookie': 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;'
    }
  });

}

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, post);
