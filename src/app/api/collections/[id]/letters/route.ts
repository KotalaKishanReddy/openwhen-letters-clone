import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()

  // Get current max position
  const { data: existing } = await supabase
    .from('letters').select('position')
    .eq('collection_id', params.id)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing?.[0]?.position ?? -1

  const { data, error } = await supabase.from('letters').insert({
    collection_id: params.id,
    position: position + 1,
    trigger_label: 'you open this letter',
    card_color: 'default',
    card_emoji: '💌',
    content_html: '',
    sticker_set: [],
    bg_pattern: 'none',
    text_color: '#3d2c1e'
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
