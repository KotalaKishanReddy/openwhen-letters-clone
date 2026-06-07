import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, makeAuthCookie } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/ratelimit'

// Dummy hash for timing-safe comparison when user not found
const DUMMY_HASH = '$2b$12$invalidhashpadding0000000000000000000000000000000000000'

export async function POST(req: NextRequest) {
  // ── Rate limiting: 5 attempts per IP per 15 minutes ──────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown'
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes.' },
      {
        status: 429,
        headers: {
          'Retry-After':        String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit':  '5',
          'X-RateLimit-Reset':  String(rl.resetAt),
        },
      }
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let username: string, password: string
  try {
    const body = await req.json()
    username = (body.username ?? '').toString().trim().slice(0, 128)
    password = (body.password ?? '').toString().slice(0, 256)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  // ── Lookup admin ──────────────────────────────────────────────────────────
  const supabase = createServiceClient()
  const { data: admin } = await supabase
    .from('admin_config')
    .select('id, username, password_hash')
    .eq('username', username)
    .single()

  // Always run bcrypt to prevent timing-based user enumeration
  const hashToCheck = admin?.password_hash ?? DUMMY_HASH
  const valid = await bcrypt.compare(password, hashToCheck)

  if (!admin || !valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // ── Issue JWT cookie ──────────────────────────────────────────────────────
  const token = await signAdminToken()
  const res   = NextResponse.json({ ok: true })
  res.cookies.set(makeAuthCookie(token))
  return res
}
