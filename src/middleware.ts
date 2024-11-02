import {NextRequest, NextResponse} from "next/server";
import {getUserIdAndRoleToHeaders, Role, validationAuthToken} from "@/server/middlewares";
import {MyNRError} from "@/utils/MyNRError";

const routerMap = new Map<string[], (req: NextRequest) => Promise<NextResponse> | Promise<void> | NextResponse | undefined>();

const pathRequireTokenAdminRole = [
  '/manage',
];

routerMap.set(pathRequireTokenAdminRole, (req: NextRequest) => validationAuthToken(req, {
  role: Role.ADMIN,
  validateMethod: ['GET', 'POST', 'PUT', 'DELETE']
}));

routerMap.set(['/api/hot', '/api/user'], (req: NextRequest) => validationAuthToken(req, {
  role: Role.ADMIN,
  validateMethod: ['POST', 'PUT', 'DELETE']
}));

export async function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;
  let newHeaders: Headers | undefined | NextResponse = undefined;
  try {

    // handle all requests that have token in cookie
    if (req.cookies.has('token')) {
      newHeaders = getUserIdAndRoleToHeaders(req);
      if (newHeaders instanceof NextResponse) return newHeaders;
    }

    // 遍历 routerMap 并将符合条件的中间件执行
    for (const [pathList, mdw] of routerMap) {
      if (pathList.some(path => pathname.startsWith(path))) {
        // console.log('Middleware', pathname, pathList);
        const res = mdw(req);
        if (res instanceof NextResponse) return res;
        if (res instanceof Headers) {
          newHeaders = newHeaders ? new Headers([...newHeaders, ...res]) : res;
        }
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
  return NextResponse.next({
    request: {
      headers: newHeaders
    }
  });
}

export const config = {
  matcher: [
    // admin page is protected
    '/manage/:path*',

    // login and register need to encrypt password
    '/api/user/login',
    '/api/user/register',

    // some api should be protected
    '/api/hot/:path*',
    '/api/user/:path*',

    // all pages and api which cookie has token should be get user's id and role from token in cookie
    '/api/:path*',
  ]
}
