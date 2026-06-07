'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Eye, Edit3, Trash2, Share2, Globe, Lock, BarChart2, LogOut } from 'lucide-react'
import type { Collection } from '@/lib/types'

export default function DashboardClient({ collections: initial }: { collections: Collection[] }) {
  const router = useRouter()
  const [collections, setCollections] = useState(initial)
  const [creating, setCreating] = useState(false)

  async function createCollection() {
    setCreating(true)
    const res = await fetch('/api/collections', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      toast.success('Collection created!')
      router.push(`/admin/editor/${data.id}`)
    } else {
      toast.error(data.error)
      setCreating(false)
    }
  }

  async function togglePublish(col: Collection) {
    const res = await fetch(`/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !col.is_published })
    })
    if (res.ok) {
      setCollections(prev => prev.map(c => c.id === col.id ? { ...c, is_published: !c.is_published } : c))
      toast.success(col.is_published ? 'Unpublished' : 'Published! 🎉')
    }
  }

  async function deleteCollection(id: string) {
    if (!confirm('Delete this collection and all its letters? This cannot be undone.')) return
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Deleted')
    }
  }

  async function copyShareLink(slug: string) {
    const url = `${window.location.origin}/view/${slug}`
    await navigator.clipboard.writeText(url)
    toast.success('Link copied! 🔗')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-brown/10
        flex items-center justify-between px-6 md:px-10 py-4">
        <span className="font-serif-display italic text-2xl text-brown">openwhen</span>
        <div className="flex items-center gap-3">
          <button onClick={createCollection} disabled={creating}
            className="flex items-center gap-2 bg-brown text-cream px-5 py-2.5
              rounded-full text-sm font-medium hover:opacity-85 transition disabled:opacity-50">
            <Plus size={15}/> {creating ? 'creating...' : 'new collection'}
          </button>
          <button onClick={logout}
            className="p-2.5 rounded-full border border-brown/15 hover:bg-beige transition text-brown-light">
            <LogOut size={15}/>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif-display italic text-4xl text-brown mb-2">your collections</h1>
        <p className="text-brown-light text-sm mb-10">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>

        {collections.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💌</div>
            <p className="text-brown-light">no collections yet — create your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {collections.map(col => (
              <div key={col.id}
                className="bg-white rounded-2xl border border-brown/10 shadow-card p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl mb-1">{col.cover_emoji}</p>
                    <h2 className="font-serif-display italic text-xl text-brown">{col.title}</h2>
                    <p className="text-sm text-brown-light">for {col.recipient_name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    col.is_published ? 'bg-sage text-sage-dark' : 'bg-beige text-brown-light'
                  }`}>
                    {col.is_published ? 'live' : 'draft'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-brown-light">
                  <BarChart2 size={12}/>
                  <span>{col.view_count} views</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/admin/editor/${col.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
                      text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
                    <Edit3 size={12}/> edit
                  </Link>
                  <Link href={`/view/${col.slug}`} target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
                      text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
                    <Eye size={12}/> preview
                  </Link>
                  <button onClick={() => togglePublish(col)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
                      text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
                    {col.is_published ? <Lock size={12}/> : <Globe size={12}/>}
                    {col.is_published ? 'unpublish' : 'publish'}
                  </button>
                  {col.is_published && (
                    <button onClick={() => copyShareLink(col.slug)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blush
                        text-brown text-xs font-medium hover:bg-blush-dark hover:text-white transition">
                      <Share2 size={12}/> copy link
                    </button>
                  )}
                  <button onClick={() => deleteCollection(col.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full
                      text-xs font-medium text-red-400 hover:bg-red-50 transition ml-auto">
                    <Trash2 size={12}/> delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
