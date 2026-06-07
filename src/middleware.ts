import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE } from './lib/auth'

/**
 * Edge middleware — runs on every matched request before it hits a route handler.
 *
 * Auth rules:
 *  /admin/*          → requires valid JWT cookie (except /admin/login)
 *  /api/auth/*       → public (login / logout)
 *  /api/collections  → GET allowed without auth (public landing data only)
 *  /api/*            → all other routes require valid JWT cookie
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin pages ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(COOKIE)?.value
    const valid = token ? await verifyAdminToken(token) : false
    if (!valid) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // ── API routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // Auth endpoints are public
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    // Public read: GET /api/collections only (for landing page stats / slug lookup)
    if (req.method === 'GET' && pathname === '/api/collections') {
      return NextResponse.next()
    }

    // Everything else requires a valid session
    const token = req.cookies.get(COOKIE)?.value
    const valid = token ? await verifyAdminToken(token) : false
    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Bearer realm="openwhen-admin"' },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
