import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Clerk middleware for Next.js 15+ (replaces middleware.ts)
export default clerkMiddleware(async (auth: any, req: NextRequest) => {
  const { userId } = await auth();
  
  // Protected routes
  const pathname = req.nextUrl.pathname;
  const publicApiRoutes = [
    '/api/telegram/webhook',
    '/api/webhooks/clerk',
    '/api/subscription/webhook',
    '/api/cron/external',
  ];
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           (pathname.startsWith('/api/') && !isPublicApiRoute && !pathname.includes('/api/public'));
  
  if (isProtectedRoute && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
