import {NextRequest, NextResponse} from "next/server";
import {Role, validationAuthToken} from "@/server/middlewares";
import {encryptPwdWithSalt} from "@/server/ApiUtils/encryption";

const routerMap = new Map<string[], (req: NextRequest) => Promise<NextResponse> | Promise<void> | NextResponse | undefined>();

const pathRequireTokenAdminRole = [
  '/manage',
];
const pathRequireEncryptWithSalt = [
    '/api/user/login',
    '/api/user/register',
]

routerMap.set(pathRequireTokenAdminRole, (req: NextRequest) => validationAuthToken(req, {
  role: Role.ADMIN,
  validateMethod: ['GET', 'POST', 'PUT', 'DELETE']
}));
// routerMap.set(pathRequireEncryptWithSalt, (req: NextRequest) => encryptPwdWithSalt(req));

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
    console.error('Middleware error', e);
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
