// AIO.MS — RBAC Middleware
// Protects dashboard routes with JWT verification and role-based access control

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, pathnameToModuleCode, hasModuleAccess } from '@/lib/auth';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/403'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, static files, and API routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for JWT token
  const token = request.cookies.get('aio-token')?.value;

  // Fallback: also check old cookie for backward compatibility
  const oldSession = request.cookies.get('aio-session')?.value;

  if (!token && !oldSession) {
    // No auth at all → redirect to login
    if (pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If we have a JWT token, verify it and check RBAC
  if (token) {
    const payload = await verifyToken(token);

    if (!payload) {
      // Token expired or invalid → clear cookies and redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('aio-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('aio-session', '', { maxAge: 0, path: '/' });
      return response;
    }

    // RBAC: Check module access
    if (pathname.startsWith('/dashboard')) {
      const moduleCode = pathnameToModuleCode(pathname);

      if (moduleCode && moduleCode !== 'KMS') {
        // Check if user has view permission for this module
        if (!hasModuleAccess(payload.permissions, moduleCode, 'view')) {
          // No permission → redirect to 403 page
          const forbiddenUrl = new URL('/403', request.url);
          forbiddenUrl.searchParams.set('module', moduleCode);
          return NextResponse.redirect(forbiddenUrl);
        }
      }
    }
  }

  // If only old session exists (no JWT), allow access for backward compatibility
  // This will be removed once all users re-login with the new system

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
