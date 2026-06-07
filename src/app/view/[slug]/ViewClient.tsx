'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Collection, Letter } from '@/lib/types'
import { CARD_COLORS, FONT_OPTIONS } from '@/lib/utils'

type Props = { collection: Collection; letters: Letter[] }

const FONT_MAP: Record<string, string> = {
  serif: "'Instrument Serif', Georgia, serif",
  sans:  "'Inter', system-ui, sans-serif",
  mono:  "'Courier New', monospace"
}

export default function ViewClient({ collection, letters }: Props) {
  const [opened, setOpened] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<Letter | null>(null)

  const fontFamily = FONT_MAP[collection.font_style] || FONT_MAP.serif

  function openLetter(letter: Letter) {
    // Check if locked
    if (letter.is_locked && letter.unlock_date) {
      if (new Date(letter.unlock_date) > new Date()) {
        alert(`This letter unlocks on ${new Date(letter.unlock_date).toLocaleDateString()} 🔒`)
        return
      }
    }
    setOpened(prev => new Set([...prev, letter.id]))
    setActive(letter)
  }

  function getCardBg(letter: Letter): string {
    if (letter.card_color === 'custom' && letter.card_bg_hex) return letter.card_bg_hex
    return CARD_COLORS[letter.card_color]?.bg || '#ffffff'
  }

  return (
    <div className="min-h-screen" style={{ background: collection.cover_color, fontFamily }}>

      {/* Collection header */}
      <header className="text-center py-16 px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}>
          <div className="text-6xl mb-4">{collection.cover_emoji}</div>
          <p className="text-xs uppercase tracking-widest text-brown/60 mb-2">a collection for</p>
          <h1 className="font-serif-display italic text-5xl text-brown mb-4">{collection.recipient_name}</h1>
          {collection.description && (
            <p className="text-brown/70 max-w-md mx-auto leading-relaxed">{collection.description}</p>
          )}
          <p className="text-xs text-brown/40 mt-6">
            {letters.length} letter{letters.length !== 1 ? 's' : ''} waiting for you ✔ open each when the moment is right
          </p>
        </motion.div>
      </header>

      {/* Letters grid */}
      <main className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {letters.map((letter, i) => {
            const isOpen = opened.has(letter.id)
            const isLocked = letter.is_locked && letter.unlock_date
              && new Date(letter.unlock_date) > new Date()

            return (
              <motion.div key={letter.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => openLetter(letter)}
                className="envelope-card rounded-2xl cursor-pointer"
                style={{ minHeight: 160 }}>
                <div className="envelope-inner rounded-2xl border border-brown/10 shadow-card"
                  style={{ background: getCardBg(letter) }}>
                  {/* Front */}
                  <div className={`envelope-face rounded-2xl p-6 flex flex-col gap-2 ${isOpen ? 'hidden' : ''}`}>
                    <p className="text-xs uppercase tracking-widest opacity-50" style={{ color: letter.text_color }}>
                      open when...
                    </p>
                    <p className="font-serif-display italic text-xl leading-snug" style={{ color: letter.text_color }}>
                      {letter.trigger_label}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl">{letter.card_emoji}</span>
                      {isLocked && <span className="text-xs opacity-50">🔒 locked</span>}
                    </div>
                    {letter.sticker_set?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {letter.sticker_set.slice(0,5).map((s, j) => (
                          <span key={j} className="text-sm">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Letter modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(61,44,30,.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setActive(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className={`relative max-w-lg w-full max-h-[85vh] overflow-y-auto
                rounded-2xl shadow-lift p-8 pattern-${active.bg_pattern}`}
              style={{
                background: active.card_color === 'custom' && active.card_bg_hex
                  ? active.card_bg_hex
                  : CARD_COLORS[active.card_color]?.bg || '#fff',
                fontFamily: active.font_override ? FONT_MAP[active.font_override] : fontFamily,
                color: active.text_color || '#3d2c1e'
              }}>

              <button onClick={() => setActive(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brown/10 hover:bg-brown/20
                  flex items-center justify-center text-sm transition">
                ✕
              </button>

              <p className="text-xs uppercase tracking-widest opacity-50 mb-1">open when...</p>
              <h2 className="font-serif-display italic text-2xl mb-5">{active.trigger_label}</h2>

              {active.sticker_set?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {active.sticker_set.map((s, i) => (
                    <span key={i} className="text-2xl">{s}</span>
                  ))}
                </div>
              )}

              <div className="prose-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: active.content_html }} />

              <div className="mt-6 pt-4 border-t border-current/10 flex justify-end">
                <span className="text-xs opacity-40">{active.card_emoji}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View-only watermark */}
      <div className="fixed bottom-4 right-4 bg-brown/10 backdrop-blur-sm
        text-brown/50 text-xs px-3 py-1.5 rounded-full pointer-events-none">
        view only 💌
      </div>
    </div>
  )
}
