/* -----------------------------------------------------------------------------
 * src/middleware.ts — gate every page + API route behind the lock screen.
 * Public routes: /login, /api/auth, static files, the lock-screen logo.
 * -------------------------------------------------------------------------- */

import { NextResponse, type NextRequest } from 'next/server';
import { cookieName, verifySessionToken } from './lib/auth';

const PUBLIC_PREFIXES = ['/login', '/api/auth', '/_next', '/favicon', '/logo'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get(cookieName())?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  /* For API calls return 401 so the front-end can react gracefully. */
  if (pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'unauthenticated' }), {
      status:  401,
      headers: { 'content-type': 'application/json' },
    });
  }
  /* Otherwise bounce to the lock screen. */
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
