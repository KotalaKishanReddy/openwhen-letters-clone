'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Collection, Letter } from '@/lib/types'
import { CARD_COLORS } from '@/lib/utils'

type Props = { collection: Collection; letters: Letter[] }

const FONT_MAP: Record<string, string> = {
  serif: "'Instrument Serif', Georgia, serif",
  sans:  "'Inter', system-ui, sans-serif",
  mono:  "'Courier New', monospace",
}

export default function ViewClient({ collection, letters }: Props) {
  const [opened, setOpened] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<Letter | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)

  const fontFamily = FONT_MAP[collection.font_style] || FONT_MAP.serif

  function openLetter(letter: Letter) {
    if (letter.is_locked && letter.unlock_date) {
      if (new Date(letter.unlock_date) > new Date()) {
        const d = new Date(letter.unlock_date)
        setLockedMsg(
          `This letter unlocks on ${d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })} 🔒`
        )
        setTimeout(() => setLockedMsg(null), 3500)
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
    <div className="min-h-screen" style={{ background: collection.cover_color || '#fdf8f3', fontFamily }}>

      {/* Collection header */}
      <header className="text-center py-16 px-6">
        <motion.div initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: .7 }}>
          <div className="text-6xl mb-5 select-none">{collection.cover_emoji}</div>
          <p className="text-xs uppercase tracking-widest text-brown/50 mb-2">a collection for</p>
          <h1 className="font-serif-display italic text-5xl text-brown mb-4 leading-tight">
            {collection.recipient_name}
          </h1>
          {collection.description && (
            <p className="text-brown/60 max-w-sm mx-auto leading-relaxed text-sm">
              {collection.description}
            </p>
          )}
          <p className="text-xs text-brown/35 mt-6">
            {letters.length} letter{letters.length !== 1 ? 's' : ''} waiting · open each when the moment is right
          </p>
        </motion.div>
      </header>

      {/* Letters grid */}
      <main className="max-w-4xl mx-auto px-5 pb-24">
        {letters.length === 0 ? (
          <div className="text-center py-16 text-brown/40">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">no letters in this collection yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {letters.map((letter, i) => {
              const isOpen   = opened.has(letter.id)
              const isLocked = letter.is_locked && letter.unlock_date
                && new Date(letter.unlock_date) > new Date()

              return (
                <motion.div key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openLetter(letter)}
                  className={`rounded-2xl cursor-pointer select-none transition-transform
                    hover:-translate-y-1 hover:shadow-lift active:scale-95 ${
                    isLocked ? 'opacity-60' : ''
                  }`}
                  style={{ minHeight: 156 }}>

                  <div className="h-full rounded-2xl border border-brown/10 shadow-card p-6 flex flex-col gap-2"
                    style={{ background: getCardBg(letter) }}>
                    <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: letter.text_color }}>
                      open when...
                    </p>
                    <p className="font-serif-display italic text-xl leading-snug flex-1"
                      style={{ color: letter.text_color }}>
                      {letter.trigger_label}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-2xl">{letter.card_emoji}</span>
                      <div className="flex items-center gap-1.5">
                        {isLocked && <span className="text-xs opacity-40">🔒</span>}
                        {isOpen   && <span className="text-xs opacity-40">✓ opened</span>}
                      </div>
                    </div>
                    {letter.sticker_set?.length > 0 && (
                      <div className="flex flex-wrap gap-0.5">
                        {letter.sticker_set.slice(0,4).map((s, j) => (
                          <span key={j} className="text-sm">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {/* Locked letter toast */}
      <AnimatePresence>
        {lockedMsg && (
          <motion.div
            initial={{ opacity:0, y: 20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
              bg-brown text-cream text-sm px-5 py-3 rounded-full shadow-lift whitespace-nowrap">
            {lockedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(61,44,30,.55)', backdropFilter: 'blur(10px)' }}
            onClick={() => setActive(null)}>

            <motion.div
              initial={{ scale: .88, opacity: 0, y: 32 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: .88, opacity: 0, y: 32 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto
                rounded-2xl shadow-lift p-8"
              style={{
                background: active.card_color === 'custom' && active.card_bg_hex
                  ? active.card_bg_hex
                  : CARD_COLORS[active.card_color]?.bg || '#fff',
                fontFamily: active.font_override ? FONT_MAP[active.font_override] : fontFamily,
                color: active.text_color || '#3d2c1e',
              }}>

              {/* Close */}
              <button onClick={() => setActive(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-current/10
                  hover:bg-current/20 flex items-center justify-center text-sm transition">
                ✕
              </button>

              <p className="text-xs uppercase tracking-widest opacity-40 mb-1">open when...</p>
              <h2 className="font-serif-display italic text-2xl mb-5 leading-snug">{active.trigger_label}</h2>

              {active.sticker_set?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {active.sticker_set.map((s, i) => (
                    <span key={i} className="text-2xl">{s}</span>
                  ))}
                </div>
              )}

              <div
                className="prose prose-sm max-w-none leading-relaxed"
                style={{ color: active.text_color || '#3d2c1e' }}
                dangerouslySetInnerHTML={{ __html: active.content_html }}
              />

              <div className="mt-8 pt-4 border-t border-current/10 flex justify-between items-center">
                <span className="text-xs opacity-30">with love 💌</span>
                <span className="text-lg">{active.card_emoji}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 pointer-events-none">
        <span className="text-xs text-brown/30 bg-brown/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
          openwhen 💌
        </span>
      </div>
    </div>
  )
}
