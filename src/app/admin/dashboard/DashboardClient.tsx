'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Eye, Edit3, Trash2, Share2, Globe, Lock,
  BarChart2, LogOut, X, Loader2
} from 'lucide-react'
import type { Collection } from '@/lib/types'
import { CARD_COLORS, FONT_OPTIONS } from '@/lib/utils'

const COVER_PRESETS = [
  { color: '#fdf8f3', label: 'Cream' },
  { color: '#f9dde0', label: 'Blush' },
  { color: '#fef3c7', label: 'Butter' },
  { color: '#ede9fe', label: 'Lavender' },
  { color: '#d1fae5', label: 'Sage' },
  { color: '#1e1b4b', label: 'Midnight' },
]

const EMOJI_QUICK = ['💌','💕','✨','🌸','🎂','🌈','🦋','❤️','🌟','🎁','🌻','🐝']

interface NewColForm {
  title: string
  recipient_name: string
  description: string
  cover_emoji: string
  cover_color: string
  font_style: string
}

export default function DashboardClient({ collections: initial }: { collections: Collection[] }) {
  const router = useRouter()
  const [collections, setCollections] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<NewColForm>({
    title: '',
    recipient_name: '',
    description: '',
    cover_emoji: '💌',
    cover_color: '#fdf8f3',
    font_style: 'serif',
  })
  const firstInputRef = useRef<HTMLInputElement>(null)

  function openModal() {
    setForm({ title:'', recipient_name:'', description:'', cover_emoji:'💌', cover_color:'#fdf8f3', font_style:'serif' })
    setModalOpen(true)
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }

  async function createCollection(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.recipient_name.trim()) {
      toast.error('Title and recipient name are required')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Collection created! ✨')
        setModalOpen(false)
        router.push(`/admin/editor/${data.id}`)
      } else {
        toast.error(data.error || 'Failed to create')
        setCreating(false)
      }
    } catch {
      toast.error('Network error')
      setCreating(false)
    }
  }

  async function togglePublish(col: Collection) {
    const res = await fetch(`/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !col.is_published }),
    })
    if (res.ok) {
      setCollections(prev => prev.map(c => c.id === col.id ? { ...c, is_published: !c.is_published } : c))
      toast.success(col.is_published ? 'Unpublished' : 'Published! 🎉')
    }
  }

  async function deleteCollection(id: string, title: string) {
    if (!confirm(`Delete "${title}" and all its letters? This cannot be undone.`)) return
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Collection deleted')
    } else {
      toast.error('Delete failed')
    }
  }

  async function copyShareLink(slug: string) {
    const url = `${window.location.origin}/view/${slug}`
    await navigator.clipboard.writeText(url)
    toast.success('Share link copied! 🔗')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-brown/10
        flex items-center justify-between px-6 md:px-10 py-4">
        <span className="font-serif-display italic text-2xl text-brown">openwhen</span>
        <div className="flex items-center gap-3">
          <button onClick={openModal}
            className="flex items-center gap-2 bg-brown text-cream px-5 py-2.5
              rounded-full text-sm font-medium hover:opacity-85 transition">
            <Plus size={15}/> new collection
          </button>
          <button onClick={logout} title="Log out"
            className="p-2.5 rounded-full border border-brown/15 hover:bg-beige transition text-brown-light">
            <LogOut size={15}/>
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif-display italic text-4xl text-brown mb-1">your collections</h1>
        <p className="text-brown-light text-sm mb-10">
          {collections.length === 0 ? 'No collections yet' : `${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
        </p>

        {collections.length === 0 ? (
          <div className="text-center py-28 flex flex-col items-center gap-5">
            <div className="text-7xl select-none">💌</div>
            <p className="text-brown-light text-lg">no collections yet</p>
            <p className="text-brown-light/60 text-sm max-w-xs">
              Create your first collection of open-when letters for someone you love.
            </p>
            <button onClick={openModal}
              className="mt-2 bg-brown text-cream px-7 py-3 rounded-full text-sm font-medium hover:opacity-85 transition">
              create first collection →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {collections.map(col => (
              <CollectionCard
                key={col.id}
                col={col}
                onTogglePublish={() => togglePublish(col)}
                onDelete={() => deleteCollection(col.id, col.title)}
                onCopyLink={() => copyShareLink(col.slug)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Create Collection Modal ─────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(61,44,30,.45)', backdropFilter: 'blur(6px)' }}
            onClick={() => !creating && setModalOpen(false)}>

            <motion.div
              initial={{ scale: .94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: .94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-lift w-full max-w-lg max-h-[92vh] overflow-y-auto">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-brown/8">
                <div>
                  <h2 className="font-serif-display italic text-2xl text-brown">new collection</h2>
                  <p className="text-xs text-brown-light mt-0.5">fill in the details before creating</p>
                </div>
                <button onClick={() => setModalOpen(false)} disabled={creating}
                  className="w-8 h-8 rounded-full bg-beige hover:bg-brown hover:text-cream
                    flex items-center justify-center text-brown-light transition disabled:opacity-40">
                  <X size={14}/>
                </button>
              </div>

              <form onSubmit={createCollection} className="px-6 py-5 flex flex-col gap-5">

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">
                    Collection Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    value={form.title} required
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Letters for Priya"
                    maxLength={120}
                  />
                </div>

                {/* Recipient */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">
                    Recipient Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.recipient_name} required
                    onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Priya, Sis, my love"
                    maxLength={80}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">
                    Description <span className="text-brown-light font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="A short note shown on the collection page…"
                    maxLength={400}
                  />
                </div>

                {/* Cover emoji */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">Cover Emoji</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {EMOJI_QUICK.map(e => (
                      <button key={e} type="button"
                        onClick={() => setForm(f => ({ ...f, cover_emoji: e }))}
                        className={`text-2xl p-1.5 rounded-lg transition hover:scale-110 ${
                          form.cover_emoji === e ? 'bg-blush ring-2 ring-blush-dark' : 'hover:bg-beige'
                        }`}>
                        {e}
                      </button>
                    ))}
                    <input
                      value={form.cover_emoji}
                      onChange={e => setForm(f => ({ ...f, cover_emoji: e.target.value.slice(0,4) }))}
                      className="input-field w-16 text-center text-xl"
                      placeholder="✏️"
                    />
                  </div>
                </div>

                {/* Cover colour */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">Cover Background</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COVER_PRESETS.map(p => (
                      <button key={p.color} type="button" title={p.label}
                        onClick={() => setForm(f => ({ ...f, cover_color: p.color }))}
                        className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${
                          form.cover_color === p.color
                            ? 'border-brown scale-110 shadow-md'
                            : 'border-brown/20'
                        }`}
                        style={{ background: p.color }}
                      />
                    ))}
                    <div className="flex items-center gap-1.5 ml-1">
                      <input
                        type="color"
                        value={form.cover_color}
                        onChange={e => setForm(f => ({ ...f, cover_color: e.target.value }))}
                        className="w-8 h-8 rounded-full border border-brown/20 cursor-pointer p-0.5 bg-transparent"
                        title="custom colour"
                      />
                      <span className="text-xs text-brown-light font-mono">{form.cover_color}</span>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div
                    className="mt-1 rounded-xl p-4 flex items-center gap-3 border border-brown/10 transition-colors"
                    style={{ background: form.cover_color }}>
                    <span className="text-3xl">{form.cover_emoji}</span>
                    <div>
                      <p className="text-xs text-brown/50 uppercase tracking-widest">a collection for</p>
                      <p className="font-serif-display italic text-lg text-brown">
                        {form.recipient_name || 'someone special'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Font */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brown uppercase tracking-wide">Font Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map(f => (
                      <button key={f.value} type="button"
                        onClick={() => setForm(fm => ({ ...fm, font_style: f.value }))}
                        className={`py-2.5 rounded-xl text-sm border transition ${
                          form.font_style === f.value
                            ? 'border-brown bg-brown text-cream'
                            : 'border-brown/15 text-brown hover:bg-beige'
                        }`}
                        style={{ fontFamily: f.css }}>
                        {f.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1 border-t border-brown/8">
                  <button type="button" onClick={() => setModalOpen(false)} disabled={creating}
                    className="flex-1 py-3 rounded-full border border-brown/15 text-brown text-sm
                      hover:bg-beige transition disabled:opacity-40">
                    cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-3 rounded-full bg-brown text-cream text-sm font-medium
                      hover:opacity-85 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {creating
                      ? <><Loader2 size={14} className="animate-spin"/> creating...</>
                      : 'create collection →'
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Collection Card Component ──────────────────────────────────────────────
function CollectionCard({
  col, onTogglePublish, onDelete, onCopyLink
}: {
  col: Collection
  onTogglePublish: () => void
  onDelete: () => void
  onCopyLink: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-brown/10 shadow-card p-6 flex flex-col gap-4
      hover:shadow-lift transition-shadow">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: col.cover_color || '#fdf8f3' }}>
            {col.cover_emoji}
          </div>
          <div>
            <h2 className="font-serif-display italic text-xl text-brown leading-tight">{col.title}</h2>
            <p className="text-sm text-brown-light mt-0.5">for {col.recipient_name}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
          col.is_published
            ? 'bg-sage/40 text-sage-dark'
            : 'bg-beige text-brown-light'
        }`}>
          {col.is_published ? '● live' : '○ draft'}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-brown-light">
        <span className="flex items-center gap-1">
          <BarChart2 size={11}/> {col.view_count ?? 0} view{col.view_count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
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
        <button onClick={onTogglePublish}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
            text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
          {col.is_published ? <><Lock size={12}/> unpublish</> : <><Globe size={12}/> publish</>}
        </button>
        {col.is_published && (
          <button onClick={onCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blush
              text-brown text-xs font-medium hover:bg-blush-dark hover:text-white transition">
            <Share2 size={12}/> copy link
          </button>
        )}
        <button onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full
            text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition ml-auto">
          <Trash2 size={12}/> delete
        </button>
      </div>
    </div>
  )
}
