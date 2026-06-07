import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptText } from '@/lib/encrypt'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  // Encrypt content before storing
  if (body.content_html !== undefined) {
    body.content_html = body.content_html
      ? await encryptText(body.content_html)
      : ''
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('letters').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return decrypted version back to client
  return NextResponse.json({ ...data, content_html: req.body ? body.content_html : '' })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('letters').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
