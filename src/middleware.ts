import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin panel is hidden behind a secret URL path from env var
// Default: /admin-secret-panel (if env not set, for local dev)
const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || '/admin-secret-panel';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ganesh2026';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle secret admin login page
  if (pathname === ADMIN_SECRET_PATH + '/login' || pathname === '/api/admin/login') {
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
        // Redirect to the SECRET login page, not /login
        const loginUrl = new URL(ADMIN_SECRET_PATH + '/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.headers.set('x-middleware-cache', 'no-cache');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        return response;
      }
    }
  }

  // Handle the secret path - rewrite to /login or /admin internally
  if (pathname.startsWith(ADMIN_SECRET_PATH)) {
    // Rewrite /admin-secret-panel/login -> /login
    if (pathname === ADMIN_SECRET_PATH + '/login') {
      return NextResponse.rewrite(new URL('/login', request.url));
    }
    // Rewrite /admin-secret-panel -> /admin, /admin-secret-panel/events -> /admin/events, etc.
    const subPath = pathname.replace(ADMIN_SECRET_PATH, '/admin');
    return NextResponse.rewrite(new URL(subPath, request.url));
  }

  // Block direct access to /login and /admin from public (return 404)
  if (pathname === '/login') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // No-cache headers for all responses
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/:secret*'],
};
