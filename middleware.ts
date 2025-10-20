import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to root, login routes, signup, and static assets
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check authentication for admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')?.value

    if (!adminToken) {
      // Redirect to root page for login
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Check authentication for partner routes
  if (pathname.startsWith('/partner')) {
    const partToken = request.cookies.get('part-token')?.value

    if (!partToken) {
      // Redirect to root page for login
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}