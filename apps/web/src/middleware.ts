import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { PUBLIC_ROUTES } from '@/config/routes';

const AUTH_COOKIE = 'oxubiraz_token';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const PUSHER_HOST = process.env.NEXT_PUBLIC_PUSHER_HOST ?? '*.pusher.com';
const WS_ORIGINS = `wss://${PUSHER_HOST} ws://localhost:* wss://ws-eu.pusher.com`;

function buildCsp(nonce: string): string {
  const directives: Record<string, string> = {
    'default-src': "'self'",
    'script-src': `'self' 'nonce-${nonce}' 'strict-dynamic'`,
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: blob: https:",
    'font-src': "'self' data:",
    'connect-src': `'self' ${API_ORIGIN} ${WS_ORIGINS} https://vitals.vercel-insights.com`,
    'worker-src': "'self' blob:",
    'frame-ancestors': "'none'",
    'form-action': "'self'",
    'base-uri': "'self'",
    'object-src': "'none'",
    'upgrade-insecure-requests': '',
  };

  return Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = !!token;

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  // Security headers
  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Pass nonce to layout via header (read in root layout if needed)
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js|offline.html|robots.txt|sitemap.xml).*)',
  ],
};
