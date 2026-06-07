import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Redirect all traffic to https://i.huashui.cc
  return NextResponse.redirect(new URL('https://i.huashui.cc'), 301);
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
