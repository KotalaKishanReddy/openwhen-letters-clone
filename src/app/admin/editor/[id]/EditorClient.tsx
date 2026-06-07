'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Save, Eye, Globe, Lock,
  Trash2, GripVertical, ChevronDown, ChevronUp, Settings
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
  const [saving, setSaving] = useState(false)
  const [openLetter, setOpenLetter] = useState<string | null>(null)
  const [colSettingsOpen, setColSettingsOpen] = useState(false)

  // ---- Collection save ----
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
        font_style: col.font_style
      })
    })
    setSaving(false)
    if (res.ok) toast.success('Saved!')
    else toast.error('Save failed')
  }

  // ---- Letter CRUD ----
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
      body: JSON.stringify(letter)
    })
    if (res.ok) toast.success('Letter saved 💌')
    else toast.error('Failed to save')
  }

  async function deleteLetter(id: string) {
    if (!confirm('Delete this letter?')) return
    const res = await fetch(`/api/letters/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLetters(prev => prev.filter(l => l.id !== id))
      if (openLetter === id) setOpenLetter(null)
      toast.success('Deleted')
    }
  }

  function updateLetter(id: string, patch: Partial<Letter>) {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }

  async function togglePublish() {
    const res = await fetch(`/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !col.is_published })
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

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-brown/10
        flex items-center justify-between px-4 md:px-8 py-3.5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard"
            className="p-2 rounded-full hover:bg-beige transition text-brown-light">
            <ArrowLeft size={16}/>
          </Link>
          <span className="font-serif-display italic text-xl text-brown">{col.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setColSettingsOpen(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
              text-brown text-xs font-medium hover:bg-brown hover:text-cream transition">
            <Settings size={12}/> settings
          </button>
          <button onClick={saveCollection} disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-beige
              text-brown text-xs font-medium hover:bg-brown hover:text-cream transition disabled:opacity-50">
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
                ? 'bg-sage text-sage-dark hover:bg-red-100 hover:text-red-600'
                : 'bg-blush text-brown hover:bg-blush-dark hover:text-white'
            )}>
            {col.is_published ? <><Lock size={12}/> unpublish</> : <><Globe size={12}/> publish</>}
          </button>
          {col.is_published && (
            <button onClick={copyShareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brown text-cream
                text-xs font-medium hover:opacity-85 transition">
              🔗 copy link
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid md:grid-cols-[320px_1fr] gap-6">

        {/* Left: Collection settings + letter list */}
        <aside className="flex flex-col gap-5">

          {/* Collection settings panel */}
          <AnimatePresence>
          {colSettingsOpen && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              className="bg-white rounded-2xl border border-brown/10 shadow-card p-5 flex flex-col gap-4">
              <h3 className="font-medium text-sm text-brown">Collection Settings</h3>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">title</span>
                <input value={col.title}
                  onChange={e => setCol(c => ({ ...c, title: e.target.value }))}
                  className="input-field" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">recipient name</span>
                <input value={col.recipient_name}
                  onChange={e => setCol(c => ({ ...c, recipient_name: e.target.value }))}
                  className="input-field" placeholder="e.g. Sis" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">description</span>
                <textarea value={col.description || ''}
                  onChange={e => setCol(c => ({ ...c, description: e.target.value }))}
                  className="input-field resize-none" rows={2} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">cover emoji</span>
                <input value={col.cover_emoji}
                  onChange={e => setCol(c => ({ ...c, cover_emoji: e.target.value }))}
                  className="input-field w-20" maxLength={2} />
              </label>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">cover background</span>
                <ColorPicker value={col.cover_color}
                  onChange={v => setCol(c => ({ ...c, cover_color: v }))} />
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-brown-light">font style</span>
                <select value={col.font_style}
                  onChange={e => setCol(c => ({ ...c, font_style: e.target.value }))}
                  className="input-field">
                  {FONT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </label>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Letter list */}
          <div className="bg-white rounded-2xl border border-brown/10 shadow-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-sm text-brown">letters ({letters.length})</h3>
              <button onClick={addLetter}
                className="flex items-center gap-1 text-xs text-brown-light hover:text-brown">
                <Plus size={13}/> add
              </button>
            </div>
            {letters.length === 0 && (
              <p className="text-xs text-brown-light py-4 text-center">no letters yet</p>
            )}
            {letters.map((l, i) => (
              <button key={l.id} onClick={() => setOpenLetter(openLetter === l.id ? null : l.id)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition flex items-center gap-2',
                  openLetter === l.id ? 'bg-brown text-cream' : 'hover:bg-beige text-brown'
                )}>
                <GripVertical size={12} className="opacity-40 shrink-0"/>
                <span className="truncate flex-1">{l.card_emoji} {l.trigger_label || 'untitled'}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right: Letter editor */}
        <main>
          {!activeLetter ? (
            <div className="flex flex-col items-center justify-center h-64 text-brown-light">
              <span className="text-4xl mb-3">✉️</span>
              <p className="text-sm">select a letter to edit, or add a new one</p>
            </div>
          ) : (
            <LetterEditor
              letter={activeLetter}
              onChange={patch => updateLetter(activeLetter.id, patch)}
              onSave={() => saveLetter(activeLetter)}
              onDelete={() => deleteLetter(activeLetter.id)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// ----- Inline LetterEditor component -----
function LetterEditor({
  letter, onChange, onSave, onDelete
}: {
  letter: Letter
  onChange: (patch: Partial<Letter>) => void
  onSave: () => void
  onDelete: () => void
}) {
  const [stickerOpen, setStickerOpen] = useState(false)

  return (
    <motion.div key={letter.id} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
      className="bg-white rounded-2xl border border-brown/10 shadow-card p-6 flex flex-col gap-5">

      {/* Trigger label */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-brown-light uppercase tracking-wide">open when...</label>
        <input value={letter.trigger_label}
          onChange={e => onChange({ trigger_label: e.target.value })}
          className="input-field text-lg font-serif-display italic"
          placeholder="you're stressed" />
      </div>

      {/* Card appearance */}
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
            className="input-field" maxLength={2} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">text color</label>
          <ColorPicker value={letter.text_color}
            onChange={v => onChange({ text_color: v })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">background pattern</label>
          <select value={letter.bg_pattern}
            onChange={e => onChange({ bg_pattern: e.target.value })}
            className="input-field">
            {Object.keys(BG_PATTERNS).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom bg color if custom selected */}
      {letter.card_color === 'custom' && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-brown-light">custom card color</label>
          <ColorPicker value={letter.card_bg_hex || '#ffffff'}
            onChange={v => onChange({ card_bg_hex: v })} />
        </div>
      )}

      {/* Font override */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-brown-light">font override (optional)</label>
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
            className="text-xs text-brown-light hover:text-brown">
            {stickerOpen ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {letter.sticker_set.map((s, i) => (
            <span key={i} className="text-lg cursor-pointer"
              onClick={() => onChange({ sticker_set: letter.sticker_set.filter((_, j) => j !== i) })}>
              {s}
            </span>
          ))}
        </div>
        {stickerOpen && (
          <div className="flex flex-wrap gap-2 bg-beige rounded-xl p-3">
            {STICKER_SETS.map(s => (
              <button key={s} onClick={() => onChange({ sticker_set: [...letter.sticker_set, s] })}
                className="text-xl hover:scale-125 transition-transform">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Rich text content */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-brown-light">letter content</label>
        <div className="border border-brown/15 rounded-xl overflow-hidden">
          <RichEditor
            content={letter.content_html}
            onChange={v => onChange({ content_html: v })}
          />
        </div>
      </div>

      {/* Lock settings */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id={`lock-${letter.id}`} checked={letter.is_locked}
          onChange={e => onChange({ is_locked: e.target.checked })}
          className="rounded" />
        <label htmlFor={`lock-${letter.id}`} className="text-xs text-brown-light">
          lock until date
        </label>
        {letter.is_locked && (
          <input type="datetime-local" value={letter.unlock_date?.slice(0,16) || ''}
            onChange={e => onChange({ unlock_date: e.target.value })}
            className="input-field text-xs ml-2" />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600">
          <Trash2 size={12}/> delete letter
        </button>
        <button onClick={onSave}
          className="flex items-center gap-1.5 bg-brown text-cream px-5 py-2.5
            rounded-full text-sm font-medium hover:opacity-85 transition">
          <Save size={13}/> save letter
        </button>
      </div>
    </motion.div>
  )
}
