import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptText } from '@/lib/encrypt'
import EditorClient from './EditorClient'

export default async function EditorPage({ params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession()
  if (!isAdmin) redirect('/admin/login')

  const supabase = createServiceClient()
  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!collection) redirect('/admin/dashboard')

  const { data: rawLetters } = await supabase
    .from('letters')
    .select('*')
    .eq('collection_id', params.id)
    .order('position')

  // Safely decrypt — fall back to raw value if content is plain text or empty
  const letters = await Promise.all(
    (rawLetters || []).map(async l => {
      let content_html = ''
      if (l.content_html) {
        try {
          content_html = await decryptText(l.content_html)
        } catch {
          // Not encrypted yet (e.g. legacy plain-text row) — use as-is
          content_html = l.content_html
        }
      }
      return { ...l, content_html }
    })
  )

  return <EditorClient collection={collection} letters={letters} />
}
