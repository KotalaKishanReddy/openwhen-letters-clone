import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptText } from '@/lib/encrypt'
import ViewClient from './ViewClient'

export default async function ViewPage({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient()

  const { data: collection } = await supabase
    .from('collections').select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!collection) notFound()

  // Increment view count
  await supabase.rpc('increment_view_count', { collection_slug: params.slug })

  const { data: rawLetters } = await supabase
    .from('letters').select('*')
    .eq('collection_id', collection.id)
    .order('position')

  // Decrypt content server-side before sending to client
  const letters = await Promise.all((rawLetters || []).map(async l => ({
    ...l,
    content_html: l.content_html ? await decryptText(l.content_html) : ''
  })))

  return <ViewClient collection={collection} letters={letters} />
}
