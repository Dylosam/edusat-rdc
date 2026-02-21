import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_KEY = 'edusat_user';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/calendar',
  '/subjects',
  '/chapters',
  '/lessons',
  '/quiz',
  '/subscription',
];

const AUTH_PREFIXES = ['/auth/login', '/auth/register'];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignorer assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isAuthPage = startsWithAny(pathname, AUTH_PREFIXES);

  const hasCookie = req.cookies.get(COOKIE_KEY)?.value;

  // ✅ pas connecté → interdit sur pages protégées
  if (isProtected && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ✅ connecté → interdit d’aller sur login/register
  if (isAuthPage && hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
