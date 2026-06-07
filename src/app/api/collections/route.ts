import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  // Public: return minimal collection list (for landing stats)
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('collections')
    .select('id, slug, title, recipient_name, cover_emoji, cover_color, is_published, view_count')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string> = {}
  try { body = await req.json() } catch { /* empty body ok */ }

  const title          = (body.title          || 'Untitled Collection').slice(0, 120)
  const recipient_name = (body.recipient_name || 'you').slice(0, 80)
  const description    = (body.description    || '').slice(0, 400)
  const cover_emoji    = (body.cover_emoji    || '💌').slice(0, 4)
  const cover_color    = (body.cover_color    || '#fdf8f3').slice(0, 30)
  const font_style     = ['serif','sans','mono'].includes(body.font_style) ? body.font_style : 'serif'

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('collections')
    .insert({ slug: generateSlug(), title, recipient_name, description, cover_emoji, cover_color, font_style })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
