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
    if (res.ok) toast.success('Letter saved 💌')
    else toast.error('Failed to save')
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
                <Plus size={13}/> add
              </button>
            </div>
            {letters.length === 0 && (
              <div className="text-xs text-brown-light py-6 text-center">
                <p className="text-2xl mb-2">✉️</p>
                no letters yet — click add
              </div>
            )}
            {letters.map(l => (
              <button key={l.id} onClick={() => setOpenLetter(openLetter === l.id ? null : l.id)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition flex items-center gap-2',
                  openLetter === l.id
                    ? 'bg-brown text-cream'
                    : 'hover:bg-beige text-brown'
                )}>
                <GripVertical size={12} className="opacity-30 shrink-0"/>
                <span className="truncate flex-1">{l.card_emoji} {l.trigger_label || 'untitled'}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Right: letter editor ───────────────────────────── */}
        <main className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            {!activeLetter ? (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 text-brown-light gap-3">
                <span className="text-5xl">✉️</span>
                <p className="text-sm">select a letter or add a new one</p>
                <button onClick={addLetter}
                  className="mt-1 flex items-center gap-1.5 bg-brown text-cream px-5 py-2.5
                    rounded-full text-sm font-medium hover:opacity-85 transition">
                  <Plus size={14}/> add first letter
                </button>
              </motion.div>
            ) : (
              <motion.div key={activeLetter.id}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: .18 }}>
                <LetterEditor
                  letter={activeLetter}
                  onChange={patch => updateLetter(activeLetter.id, patch)}
                  onSave={() => saveLetter(activeLetter)}
                  onDelete={() => deleteLetter(activeLetter.id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ── LetterEditor ──────────────────────────────────────────────────────────
function LetterEditor({
  letter, onChange, onSave, onDelete
}: {
  letter: Letter
  onChange: (patch: Partial<Letter>) => void
  onSave: () => void
  onDelete: () => void
}) {
  const [stickerOpen, setStickerOpen] = useState(false)
  const [letterSaving, setLetterSaving] = useState(false)

  async function handleSave() {
    setLetterSaving(true)
    await onSave()
    setLetterSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-brown/10 shadow-card p-6 flex flex-col gap-5">

      {/* Trigger label */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-brown-light uppercase tracking-wide">open when...</label>
        <input value={letter.trigger_label}
          onChange={e => onChange({ trigger_label: e.target.value })}
          className="input-field text-lg font-serif-display italic"
          placeholder="you're feeling stressed" />
      </div>

      {/* Appearance grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">card color</label>
          <select value={letter.card_color}
            onChange={e => onChange({ card_color: e.target.value })}
            className="input-field">
            {Object.entries(CARD_COLORS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">card emoji</label>
          <input value={letter.card_emoji}
            onChange={e => onChange({ card_emoji: e.target.value })}
            className="input-field text-center text-xl" maxLength={4} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">text color</label>
          <ColorPicker value={letter.text_color} onChange={v => onChange({ text_color: v })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">bg pattern</label>
          <select value={letter.bg_pattern}
            onChange={e => onChange({ bg_pattern: e.target.value })}
            className="input-field">
            {Object.keys(BG_PATTERNS).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {letter.card_color === 'custom' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">custom card color</label>
          <ColorPicker value={letter.card_bg_hex || '#ffffff'}
            onChange={v => onChange({ card_bg_hex: v })} />
        </div>
      )}

      {/* Font override */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-brown-light">font (optional override)</label>
        <select value={letter.font_override || ''}
          onChange={e => onChange({ font_override: e.target.value || null })}
          className="input-field">
          <option value="">inherit from collection</option>
          {FONT_OPTIONS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Stickers */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-brown-light">stickers</label>
          <button onClick={() => setStickerOpen(v => !v)}
            className="text-xs text-brown-light hover:text-brown flex items-center gap-1">
            {stickerOpen ? <><ChevronUp size={12}/> hide</> : <><ChevronDown size={12}/> add</>}
          </button>
        </div>
        {letter.sticker_set?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {letter.sticker_set.map((s, i) => (
              <button key={i} title="click to remove"
                onClick={() => onChange({ sticker_set: letter.sticker_set.filter((_, j) => j !== i) })}
                className="text-xl hover:opacity-50 transition">{s}
              </button>
            ))}
          </div>
        )}
        {stickerOpen && (
          <div className="flex flex-wrap gap-2 bg-beige rounded-xl p-3">
            {STICKER_SETS.map(s => (
              <button key={s} onClick={() => onChange({ sticker_set: [...(letter.sticker_set || []), s] })}
                className="text-xl hover:scale-125 transition-transform">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Rich content */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-brown-light">letter content</label>
        <div className="border border-brown/15 rounded-xl overflow-hidden">
          <RichEditor
            content={letter.content_html}
            onChange={v => onChange({ content_html: v })}
          />
        </div>
      </div>

      {/* Date lock */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={letter.is_locked}
            onChange={e => onChange({ is_locked: e.target.checked })}
            className="rounded accent-brown" />
          <span className="text-xs text-brown-light">lock until date</span>
        </label>
        {letter.is_locked && (
          <input type="datetime-local"
            value={letter.unlock_date?.slice(0,16) || ''}
            onChange={e => onChange({ unlock_date: e.target.value })}
            className="input-field text-xs" />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center pt-2 border-t border-brown/8">
        <button onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition">
          <Trash2 size={12}/> delete letter
        </button>
        <button onClick={handleSave} disabled={letterSaving}
          className="flex items-center gap-2 bg-brown text-cream px-6 py-2.5
            rounded-full text-sm font-medium hover:opacity-85 transition disabled:opacity-50">
          {letterSaving
            ? <><span className="w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full animate-spin"/>saving...</>
            : <><Save size={13}/> save letter</>
          }
        </button>
      </div>
    </div>
  )
}
