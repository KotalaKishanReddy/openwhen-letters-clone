import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'

// ONE-TIME setup endpoint — creates the admin account
// DELETE this file after first use or protect with SETUP_SECRET env var
export async function POST(req: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET
  const { username, password, secret } = await req.json()

  if (setupSecret && secret !== setupSecret) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

  const supabase = createServiceClient()

  // Check if admin already exists
  const { data: existing } = await supabase.from('admin_config').select('id').limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Admin already configured' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const { error } = await supabase.from('admin_config').insert({ username, password_hash: hash })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, message: 'Admin created! Delete /api/admin/setup now.' })
}
