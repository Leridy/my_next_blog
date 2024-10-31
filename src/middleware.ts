import {NextRequest, NextResponse} from "next/server";
import {Role, validationAuthToken} from "@/server/middlewares";
import {MyNRError} from "@/utils/MyNRError";

const routerMap = new Map<string[], (req: NextRequest) => Promise<NextResponse> | Promise<void> | NextResponse | undefined>();

const pathRequireTokenAdminRole = [
  '/manage',
];

routerMap.set(pathRequireTokenAdminRole, (req: NextRequest) => validationAuthToken(req, {
  role: Role.ADMIN,
  validateMethod: ['GET', 'POST', 'PUT', 'DELETE']
}));

routerMap.set(['/api/hot'], (req: NextRequest) => validationAuthToken(req, {
  role: Role.ADMIN,
  validateMethod: ['POST', 'PUT', 'DELETE']
}));

export async function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;
  try {
    console.log('Middleware running', pathname);
    // 遍历 routerMap 并将符合条件的中间件执行
    for (const [pathList, mdw] of routerMap) {
      if (pathList.some(path => pathname.startsWith(path))) {
        console.log('Middleware', pathname, pathList);
        const res = mdw(req);
        if (res) return res;
      }
    }

  } catch (e) {
    if (e instanceof MyNRError) {
      console.log(e.message, e.getData());
    } else {
      console.log((e as Error).message);
    }
    return NextResponse.error();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // admin page is protected
    '/manage/:path*',

    // login and register need to encrypt password
    '/api/hot/:path*',
    '/api/user/login',
    '/api/user/register',
  ]
}
