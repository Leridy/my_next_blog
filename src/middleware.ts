import {NextRequest, NextResponse} from "next/server";
import {validationAuthToken} from "@/server/ApiUtils/auth";

const routerMap = new Map<string[], Function>();

const pathRequireTokenRole = [
  '/manage/',
];
routerMap.set(pathRequireTokenRole, validationAuthToken);
export function middleware(req: NextRequest) {

  try {
    console.log('Middleware', req.nextUrl);

    // 遍历 routerMap 并将符合条件的中间件执行
    for (const [pathList, mw] of routerMap) {
      if (pathList.some(path => req.nextUrl.pathname.startsWith(path))) {
        mw(req);
      }
    }

  } catch (e) {
    console.error('Middleware error', e);
    NextResponse.error();
  }


  return NextResponse.next();
}

export const runtime = 'nodejs'

export const config = {
  matcher: [
    '/manage/',
  ]
}
