import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('collections').insert({
    slug: generateSlug(),
    title: 'Untitled Collection',
    recipient_name: 'you'
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
