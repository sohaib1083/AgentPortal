import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't need authentication
const PUBLIC_PATHS = ['/', '/login', '/admin-login', '/unauthorized'];

// Simple JWT decoder (doesn't validate signature, just extracts payload)
function decodeJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug output
  console.log(`Middleware checking: ${pathname}`);
  
  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // For admin routes, check for admin role
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('No token found, redirecting to login');
    const loginPath = isAdminRoute ? '/admin-login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  
  // Decode the token (simple decode without verification)
  const decoded = decodeJwt(token);
  
  if (!decoded) {
    console.log('Invalid token format');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('Token role:', decoded.role);
  
  // Check for admin role on admin routes
  if (isAdminRoute && decoded.role !== 'admin') {
    console.log('Unauthorized access to admin route');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // User is authorized, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Match all request paths except:
      - API routes
      - _next (static files)
      - public files (.ico, .jpeg, etc)
      - And the specific public routes defined above
    */
    '/((?!api|_next|.*\\.|login|admin-login|unauthorized).*)',
    '/admin/:path*'
  ],
};
