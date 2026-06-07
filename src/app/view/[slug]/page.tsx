import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptText } from '@/lib/encrypt'
import ViewClient from './ViewClient'

export default async function ViewPage({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!collection) notFound()

  // Increment view count (fire-and-forget — don't block render)
  supabase.rpc('increment_view_count', { collection_slug: params.slug }).then(() => {})

  const { data: rawLetters } = await supabase
    .from('letters')
    .select('*')
    .eq('collection_id', collection.id)
    .order('position')

  // Safely decrypt — fall back to raw value if not encrypted or empty
  const letters = await Promise.all(
    (rawLetters || []).map(async l => {
      let content_html = ''
      if (l.content_html) {
        try {
          content_html = await decryptText(l.content_html)
        } catch {
          content_html = l.content_html
        }
      }
      return { ...l, content_html }
    })
  )

  return <ViewClient collection={collection} letters={letters} />
}
