import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from './lib/auth'
import { COOKIE } from './lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(COOKIE)?.value
    const valid = token ? await verifyAdminToken(token) : false
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect all /api routes except auth
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const token = req.cookies.get(COOKIE)?.value
    const valid = token ? await verifyAdminToken(token) : false
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
}
