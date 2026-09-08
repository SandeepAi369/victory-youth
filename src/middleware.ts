import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for login page and login API
  if (pathname === '/login' || pathname.startsWith('/api/admin/login')) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Skip auth check for RSC prefetch requests (they may not include cookies)
    const isPrefetch = request.headers.get('next-router-prefetch') === '1'
      || request.headers.get('purpose') === 'prefetch';
    
    if (!isPrefetch) {
      const authCookie = request.cookies.get('admin-auth');
      
      if (!authCookie || authCookie.value !== 'ganesh2026') {
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.headers.set('x-middleware-cache', 'no-cache');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        return response;
      }
    }
  }

  // Add no-cache headers to ALL responses
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
