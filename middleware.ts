import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {logger} from "@/server/middlewares";


export function middleware(req: NextRequest) {
   // first of all, logger all request
  

    return NextResponse.next();
}

export const config = {
  matcher: [
    // login and register and logout
    '/api/user/login',
    '/api/user/register',
    '/api/user/logout',

    // user
    // '/api/user/[[...id]]',

    // validate code
    '/api/image/validateCode',

    // all manage pages should be authenticated
    // '/manage/:path*',


  ]
};
