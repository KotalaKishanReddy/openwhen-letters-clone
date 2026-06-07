'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Save, Eye, Globe, Lock,
  Trash2, GripVertical, ChevronDown, ChevronUp, Share2
} from 'lucide-react'
import type { Collection, Letter } from '@/lib/types'
import { CARD_COLORS, FONT_OPTIONS, STICKER_SETS, BG_PATTERNS, cn } from '@/lib/utils'
import RichEditor from '@/components/RichEditor'
import ColorPicker from '@/components/ColorPicker'

type Props = { collection: Collection; letters: Letter[] }

export default function EditorClient({ collection: initial, letters: initialLetters }: Props) {
  const router = useRouter()
  const [col, setCol] = useState(initial)
  const [letters, setLetters] = useState(initialLetters)
  const [colDirty, setColDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openLetter, setOpenLetter] = useState<string | null>(
    initialLetters.length === 1 ? initialLetters[0].id : null
  )

  function setColField<K extends keyof Collection>(k: K, v: Collection[K]) {
    setCol(c => ({ ...c, [k]: v }))
    setColDirty(true)
  }

  async function saveCollection() {
    setSaving(true)
    const res = await fetch(`/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: col.title,
        recipient_name: col.recipient_name,
        description: col.description,
        cover_color: col.cover_color,
        cover_emoji: col.cover_emoji,
        font_style: col.font_style,
      }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Saved!'); setColDirty(false) }
    else toast.error('Save failed')
  }

  async function addLetter() {
    const res = await fetch(`/api/collections/${col.id}/letters`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setLetters(prev => [...prev, data])
      setOpenLetter(data.id)
      toast.success('Letter added!')
    } else toast.error(data.error)
  }

  async function saveLetter(letter: Letter) {
    const res = await fetch(`/api/letters/${letter.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letter),
    })
    if (res.ok) {
      // Bug fix: update local state with the server response so updated_at
      // and any server-side changes stay in sync. Previously saveLetter never
      // updated the local letters array after a successful save.
      const updated: Letter = await res.json()
      setLetters(prev => prev.map(l => l.id === updated.id ? updated : l))
      toast.success('Letter saved 💌')
    } else {
      toast.error('Failed to save')
    }
  }

  async function deleteLetter(id: string) {
    if (!confirm('Delete this letter? This cannot be undone.')) return
    const res = await fetch(`/api/letters/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLetters(prev => prev.filter(l => l.id !== id))
      if (openLetter === id) setOpenLetter(null)
      toast.success('Letter deleted')
    }
  }

  function updateLetter(id: string, patch: Partial<Letter>) {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }

  async function togglePublish() {
    const res = await fetch(`/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !col.is_published }),
    })
    if (res.ok) {
      setCol(c => ({ ...c, is_published: !c.is_published }))
      toast.success(col.is_published ? 'Unpublished' : 'Published! 🎉')
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/view/${col.slug}`
    await navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  const activeLetter = letters.find(l => l.id === openLetter)

  const COVER_PRESETS = [
    '#fdf8f3','#f9dde0','#fef3c7','#ede9fe','#d1fae5','#1e1b4b'
  ]

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Sticky header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-brown/10
        flex items-center justify-between px-4 md:px-8 py-3.5 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/dashboard"
            className="p-2 rounded-full hover:bg-beige transition text-brown-light shrink-0">
            <ArrowLeft size={16}/>
          </Link>
          <div className="min-w-0">
            <span className="font-serif-display italic text-xl text-brown truncate block">{col.title}</span>
            <span className="text-xs text-brown-light">for {col.recipient_name}</span>
          </div>
          {colDirty && (
            <span className="text-xs bg-butter text-brown px-2 py-0.5 rounded-full shrink-0">unsaved</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={saveCollection} disabled={saving}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition disabled:opacity-50',
              colDirty ? 'bg-brown text-cream hover:opacity-85' : 'bg-beige text-brown hover:bg-brown hover:text-cream'
            )}>
            <Save size={12}/> {saving ? 'saving...' : 'save'}
          </button>
          <Link href={`/view/${col.slug}`} target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
              text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
            <Eye size={12}/> preview
          </Link>
          <button onClick={togglePublish}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition',
              col.is_published
                ? 'bg-sage/40 text-sage-dark hover:bg-red-100 hover:text-red-600'
                : 'bg-blush text-brown hover:bg-blush-dark hover:text-white'
            )}>
            {col.is_published ? <><Lock size={12}/> unpublish</> : <><Globe size={12}/> publish</>}
          </button>
          {col.is_published && (
            <button onClick={copyShareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brown text-cream
                text-xs font-medium hover:opacity-85 transition">
              <Share2 size={12}/> copy link
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid md:grid-cols-[300px_1fr] gap-6 items-start">

        {/* ── Left sidebar ──────────────────────────────────── */}
        <aside className="flex flex-col gap-4">

          {/* Collection Settings — always visible */}
          <div className="bg-white rounded-2xl border border-brown/10 shadow-card p-5 flex flex-col gap-4">
            <h3 className="font-medium text-sm text-brown">Collection</h3>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-brown-light">title</span>
              <input value={col.title}
                onChange={e => setColField('title', e.target.value)}
                className="input-field" placeholder="Collection title" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-brown-light">recipient name</span>
              <input value={col.recipient_name}
                onChange={e => setColField('recipient_name', e.target.value)}
                className="input-field" placeholder="e.g. Sis" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-brown-light">description</span>
              <textarea value={col.description || ''}
                onChange={e => setColField('description', e.target.value)}
                className="input-field resize-none" rows={2}
                placeholder="optional tagline…" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-brown-light">cover emoji</span>
              <input value={col.cover_emoji}
                onChange={e => setColField('cover_emoji', e.target.value.slice(0,4))}
                className="input-field w-20 text-center text-xl" />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-brown-light">cover background</span>
              <div className="flex items-center gap-2 flex-wrap">
                {COVER_PRESETS.map(p => (
                  <button key={p} type="button"
                    onClick={() => setColField('cover_color', p)}
                    className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${
                      col.cover_color === p ? 'border-brown scale-110' : 'border-brown/20'
                    }`}
                    style={{ background: p }}
                  />
                ))}
                <input type="color" value={col.cover_color || '#fdf8f3'}
                  onChange={e => setColField('cover_color', e.target.value)}
                  className="w-7 h-7 rounded-full border border-brown/20 cursor-pointer p-0.5 bg-transparent"
                />
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-brown-light">font style</span>
              <select value={col.font_style}
                onChange={e => setColField('font_style', e.target.value)}
                className="input-field">
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Letter list */}
          <div className="bg-white rounded-2xl border border-brown/10 shadow-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-sm text-brown">letters ({letters.length})</h3>
              <button onClick={addLetter}
                className="flex items-center gap-1 text-xs text-brown-light hover:text-brown transition">
                <Plus size={12}/> add
              </button>
            </div>
            {letters.length === 0 ? (
              <p className="text-xs text-brown-light/60 text-center py-4">
                no letters yet — add one above
              </p>
            ) : (
              letters.map(l => (
                <button key={l.id}
                  onClick={() => setOpenLetter(openLetter === l.id ? null : l.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm transition',
                    openLetter === l.id
                      ? 'bg-brown text-cream'
                      : 'hover:bg-beige text-brown-light hover:text-brown'
                  )}>
                  <span className="mr-2">{l.card_emoji}</span>
                  <span className="italic truncate">{l.trigger_label}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Right panel: letter editor ─────────────────── */}
        <div className="flex flex-col gap-4">
          {!activeLetter ? (
            <div className="bg-white rounded-2xl border border-brown/10 shadow-card
              flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="text-5xl">💌</div>
              <p className="text-brown-light text-sm">select a letter to edit,<br/>or add a new one</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeLetter.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl border border-brown/10 shadow-card overflow-hidden">

                {/* Letter header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-brown/8">
                  <h3 className="font-medium text-sm text-brown">editing letter</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteLetter(activeLetter.id)}
                      className="p-1.5 rounded-lg text-brown-light hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={13}/>
                    </button>
                    <button onClick={() => saveLetter(activeLetter)}
                      className="flex items-center gap-1.5 bg-brown text-cream px-4 py-1.5
                        rounded-full text-xs font-medium hover:opacity-85 transition">
                      <Save size={11}/> save letter
                    </button>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-5">

                  {/* Trigger label */}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-brown uppercase tracking-wide">
                      open when...
                    </span>
                    <input
                      value={activeLetter.trigger_label}
                      onChange={e => updateLetter(activeLetter.id, { trigger_label: e.target.value })}
                      className="input-field font-serif-display italic text-lg"
                      placeholder="you're feeling down"
                      maxLength={120}
                    />
                  </label>

                  {/* Card appearance row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-brown uppercase tracking-wide">card colour</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(CARD_COLORS).map(([key, { bg, label }]) => (
                          <button key={key} type="button" title={label}
                            onClick={() => updateLetter(activeLetter.id, { card_color: key })}
                            className={cn(
                              'w-7 h-7 rounded-full border-2 transition hover:scale-110',
                              activeLetter.card_color === key ? 'border-brown scale-110' : 'border-brown/20'
                            )}
                            style={{ background: bg || '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      {activeLetter.card_color === 'custom' && (
                        <ColorPicker
                          value={activeLetter.card_bg_hex || '#ffffff'}
                          onChange={v => updateLetter(activeLetter.id, { card_bg_hex: v })}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-brown uppercase tracking-wide">text colour</span>
                      <ColorPicker
                        value={activeLetter.text_color || '#3d2c1e'}
                        onChange={v => updateLetter(activeLetter.id, { text_color: v })}
                      />
                    </div>
                  </div>

                  {/* Pattern + emoji */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-brown uppercase tracking-wide">background pattern</span>
                      <select value={activeLetter.bg_pattern}
                        onChange={e => updateLetter(activeLetter.id, { bg_pattern: e.target.value })}
                        className="input-field">
                        {Object.keys(BG_PATTERNS).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-brown uppercase tracking-wide">card emoji</span>
                      <input value={activeLetter.card_emoji}
                        onChange={e => updateLetter(activeLetter.id, { card_emoji: e.target.value.slice(0,8) })}
                        className="input-field w-20 text-center text-xl"
                      />
                    </div>
                  </div>

                  {/* Font override */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-brown uppercase tracking-wide">font override</span>
                    <select
                      value={activeLetter.font_override || ''}
                      onChange={e => updateLetter(activeLetter.id, { font_override: e.target.value || null })}
                      className="input-field">
                      <option value="">Use collection font</option>
                      {FONT_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stickers */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-brown uppercase tracking-wide">stickers</span>
                    <div className="flex flex-wrap gap-2">
                      {STICKER_SETS.map(s => (
                        <button key={s} type="button"
                          onClick={() => {
                            const current = activeLetter.sticker_set || []
                            const next = current.includes(s)
                              ? current.filter(x => x !== s)
                              : [...current, s]
                            updateLetter(activeLetter.id, { sticker_set: next })
                          }}
                          className={cn(
                            'text-xl p-1 rounded-lg transition hover:scale-110',
                            (activeLetter.sticker_set || []).includes(s)
                              ? 'bg-beige ring-1 ring-brown/30'
                              : 'hover:bg-beige/60'
                          )}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lock settings */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={activeLetter.is_locked}
                        onChange={e => updateLetter(activeLetter.id, { is_locked: e.target.checked })}
                        className="w-4 h-4 rounded accent-brown"
                      />
                      <span className="text-sm text-brown-light">lock until date</span>
                    </label>
                    {activeLetter.is_locked && (
                      <input type="date"
                        value={activeLetter.unlock_date ? activeLetter.unlock_date.slice(0,10) : ''}
                        onChange={e => updateLetter(activeLetter.id, { unlock_date: e.target.value })}
                        className="input-field text-sm flex-1"
                      />
                    )}
                  </div>

                  {/* Rich text content */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-brown uppercase tracking-wide">letter content</span>
                    <div className="rounded-xl border border-brown/15 overflow-hidden"
                      style={{
                        background: activeLetter.card_color === 'custom' && activeLetter.card_bg_hex
                          ? activeLetter.card_bg_hex
                          : CARD_COLORS[activeLetter.card_color]?.bg || '#ffffff',
                        color: activeLetter.text_color || '#3d2c1e',
                      }}>
                      <RichEditor
                        content={activeLetter.content_html}
                        onChange={html => updateLetter(activeLetter.id, { content_html: html })}
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
