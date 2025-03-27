import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/sign-in', '/sign-up', '/forgot-password'];

export function middleware(request: NextRequest) {
  // Get the current path and auth storage from the cookie
  const { pathname } = request.nextUrl;
  
  // Improved token extraction
  const getToken = () => {
    try {
      const authStorage = request.cookies.get('auth-storage');

      if (!authStorage) return null;
      
      const parsed = JSON.parse(JSON.parse(decodeURIComponent(authStorage.value))); // TODO implement better solution

      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  };

  const token = getToken();
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Redirect authenticated users trying to access public paths
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Redirect unauthenticated users trying to access protected paths
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

// Configure the paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
