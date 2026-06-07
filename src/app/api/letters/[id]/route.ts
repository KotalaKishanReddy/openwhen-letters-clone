import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptText } from '@/lib/encrypt'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Keep original plaintext so we can return it to the client
  const originalHtml: string = body.content_html ?? ''

  // Encrypt content before storing
  const encryptedHtml = body.content_html !== undefined
    ? (body.content_html ? await encryptText(body.content_html) : '')
    : undefined

  // Bug fix: whitelist allowed fields instead of passing full body to Supabase.
  // Previously, the entire req body (after encrypting content_html) was forwarded
  // to .update(), allowing overwrite of collection_id, position, created_at, etc.
  const patch: Record<string, unknown> = {}
  if (body.trigger_label !== undefined) patch.trigger_label = String(body.trigger_label).slice(0, 120)
  if (body.card_color    !== undefined) patch.card_color    = String(body.card_color).slice(0, 30)
  if (body.card_bg_hex   !== undefined) patch.card_bg_hex   = body.card_bg_hex ? String(body.card_bg_hex).slice(0, 30) : null
  if (body.card_emoji    !== undefined) patch.card_emoji    = String(body.card_emoji).slice(0, 8)
  if (encryptedHtml      !== undefined) patch.content_html  = encryptedHtml
  if (body.sticker_set   !== undefined) patch.sticker_set   = Array.isArray(body.sticker_set) ? body.sticker_set.slice(0, 20) : []
  if (body.bg_pattern    !== undefined) patch.bg_pattern    = String(body.bg_pattern).slice(0, 30)
  if (body.text_color    !== undefined) patch.text_color    = String(body.text_color).slice(0, 30)
  if (body.font_override !== undefined) patch.font_override = body.font_override ? String(body.font_override).slice(0, 20) : null
  if (body.is_locked     !== undefined) patch.is_locked     = Boolean(body.is_locked)
  if (body.unlock_date   !== undefined) patch.unlock_date   = body.unlock_date ? String(body.unlock_date) : null

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('letters')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  // Return plaintext content_html back to client (not the encrypted blob)
  return NextResponse.json({ ...data, content_html: originalHtml })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('letters')
    .delete()
    .eq('id', params.id)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
