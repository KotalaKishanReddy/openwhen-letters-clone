import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

/**
 * ONE-TIME admin account creation endpoint.
 * Hardened:
 *  - Disabled entirely when SETUP_DISABLED=true
 *  - Requires SETUP_SECRET header match
 *  - Returns 409 if any admin already exists (idempotent)
 *  - After success, set SETUP_DISABLED=true in Vercel env vars and redeploy
 */
export async function POST(req: NextRequest) {
  // ── Gate 1: env flag ──────────────────────────────────────────────────────
  if (env.SETUP_DISABLED) {
    return NextResponse.json({ error: 'Setup is disabled.' }, { status: 403 })
  }

  // ── Gate 2: secret ───────────────────────────────────────────────────────
  if (!env.SETUP_SECRET) {
    return NextResponse.json(
      { error: 'SETUP_SECRET env var is not set. Setup is locked.' },
      { status: 403 }
    )
  }

  let username: string, password: string, secret: string
  try {
    const body = await req.json()
    username = (body.username ?? '').toString().trim().slice(0, 128)
    password = (body.password ?? '').toString().slice(0, 256)
    secret   = (body.secret   ?? '').toString()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Constant-time comparison to prevent timing attacks on the setup secret
  const secretBytes  = new TextEncoder().encode(secret)
  const correctBytes = new TextEncoder().encode(env.SETUP_SECRET)
  if (secretBytes.length !== correctBytes.length) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }
  let diff = 0
  for (let i = 0; i < secretBytes.length; i++) diff |= secretBytes[i] ^ correctBytes[i]
  if (diff !== 0) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 })
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 })
  }

  // ── Gate 3: already configured ───────────────────────────────────────────
  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('admin_config').select('id').limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Admin already configured. Set SETUP_DISABLED=true in your environment.' },
      { status: 409 }
    )
  }

  // ── Create admin ──────────────────────────────────────────────────────────
  const hash = await bcrypt.hash(password, 14)   // cost 14 for setup (one-time, latency ok)
  const { error } = await supabase
    .from('admin_config')
    .insert({ username, password_hash: hash })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return NextResponse.json({
    ok: true,
    message: 'Admin created. IMPORTANT: set SETUP_DISABLED=true in Vercel env vars now.',
  })
}
