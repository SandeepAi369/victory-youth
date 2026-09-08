import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ganesh2026';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow login page and login API through
  if (pathname === '/login' || pathname.startsWith('/api/admin/login')) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  // Protect all /admin routes - require auth cookie
  if (pathname.startsWith('/admin')) {
    const isPrefetch = request.headers.get('next-router-prefetch') === '1'
      || request.headers.get('purpose') === 'prefetch';

    if (!isPrefetch) {
      const authCookie = request.cookies.get('admin-auth');

      if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.headers.set('x-middleware-cache', 'no-cache');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        return response;
      }
    }
  }

  // No-cache headers for all matched responses
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
