import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Bug fix: whitelist allowed fields instead of passing body directly to Supabase.
  // Previously, the full req body was passed to .update(body) which allowed an
  // attacker to overwrite any column (id, slug, view_count, created_at, etc.).
  const patch: Record<string, unknown> = {}
  if (body.title          !== undefined) patch.title          = String(body.title).slice(0, 120)
  if (body.recipient_name !== undefined) patch.recipient_name = String(body.recipient_name).slice(0, 80)
  if (body.description    !== undefined) patch.description    = String(body.description ?? '').slice(0, 400)
  if (body.cover_color    !== undefined) patch.cover_color    = String(body.cover_color).slice(0, 30)
  if (body.cover_emoji    !== undefined) patch.cover_emoji    = String(body.cover_emoji).slice(0, 4)
  if (body.font_style     !== undefined) {
    patch.font_style = ['serif', 'sans', 'mono'].includes(body.font_style)
      ? body.font_style
      : 'serif'
  }
  if (body.is_published !== undefined) patch.is_published = Boolean(body.is_published)

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('collections')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', params.id)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
