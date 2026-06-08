'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors, BookOpen, Sparkles, Image, Sticker, Lock } from 'lucide-react'

const VERSION    = 'v2.0.0'
const CODENAME   = 'Cut & Paste'
const BUILD_DATE = 'Jun 8 2026'

const SAMPLE_CARDS = [
  { label: 'Summer Vibes ☀️',       color: '#fef3c7', tilt: '-2deg',  emoji: '🌻', tape: 'pink'  },
  { label: 'Best Friends 💛',        color: '#f0d9b5', tilt: '1.5deg', emoji: '✂️', tape: 'sage'  },
  { label: 'Trip to Goa 🌊',         color: '#b8d8e8', tilt: '-1deg',  emoji: '📸', tape: 'lemon' },
  { label: 'Birthday Memories 🎂',   color: '#f7c5d0', tilt: '2.5deg', emoji: '🎀', tape: 'lilac' },
  { label: 'Concert Night 🎶',       color: '#d4c5e8', tilt: '-2deg',  emoji: '🎸', tape: 'pink'  },
  { label: 'Coffee & Journals ☕',   color: '#e8dcc8', tilt: '1deg',   emoji: '📓', tape: 'sage'  },
  { label: 'Road Trip 🚗',           color: '#b8d4c0', tilt: '-1.5deg',emoji: '🗺️', tape: 'lemon' },
  { label: 'Graduation Day 🎓',      color: '#faf6ef', tilt: '2deg',   emoji: '🏆', tape: 'lilac' },
  { label: 'Rainy Days 🌧️',          color: '#b8d8e8', tilt: '-2.5deg',emoji: '🌂', tape: 'sky'   },
  { label: 'New Year 🎆',            color: '#f7c5d0', tilt: '1.5deg', emoji: '✨', tape: 'pink'  },
]

const FEATURES = [
  { icon: Scissors,  text: 'Cut & arrange pages' },
  { icon: Image,     text: 'Polaroid photo cards' },
  { icon: Sticker,   text: 'Stickers & washi tape' },
  { icon: BookOpen,  text: 'Multiple scrapbooks' },
  { icon: Sparkles,  text: 'Handwritten font styles' },
  { icon: Lock,      text: 'Private share links' },
]

const CARD_H  = 120
const CARD_G  = 14
const SINGLE  = SAMPLE_CARDS.length * (CARD_H + CARD_G)

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(240,217,181,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '2px solid var(--kraft)',
          boxShadow: '0 2px 0 rgba(160,112,64,.25)',
        }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none">✂️</span>
          <span className="font-handwritten text-2xl font-bold" style={{ color: 'var(--ink)' }}>
            scrapbook.
          </span>
          <span className="font-typewriter text-[10px] px-2 py-0.5 rounded"
            style={{ background: 'var(--washi-lemon)', color: 'var(--ink-light)' }}
            title={`${VERSION} — ${CODENAME}`}>
            {VERSION}
          </span>
        </div>
        <Link href="/admin/login"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-handwritten text-base transition hover:-translate-y-0.5"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            boxShadow: '2px 3px 0 var(--kraft-dark)',
          }}>
          <Lock size={13}/> open studio
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="flex-1 grid md:grid-cols-2 items-center gap-12 px-8 md:px-16 py-20 min-h-[88vh]">

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, ease: [.22, 1, .36, 1] }}>

          {/* Washi tag */}
          <div className="inline-block washi washi-sage mb-6 rotate-[-1deg]">
            ✂️ craft your story
          </div>

          <h1 className="font-display text-5xl md:text-6xl leading-[1.08] mb-6"
            style={{ color: 'var(--ink)' }}>
            Make your own<br />
            <em className="font-handwritten text-6xl md:text-7xl" style={{ color: 'var(--kraft-dark)' }}>
              scrapbook
            </em>
          </h1>

          <p className="text-lg leading-relaxed max-w-md mb-10 font-sans-ui"
            style={{ color: 'var(--ink-light)' }}>
            Arrange polaroid cards, washi tape strips, and handwritten notes
            into a beautiful digital scrapbook — just like Canva, but with a
            craft-paper soul.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/admin/login"
              className="font-handwritten text-lg px-8 py-3.5 rounded-lg transition hover:-translate-y-0.5"
              style={{
                background: 'var(--kraft-dark)',
                color: 'var(--paper)',
                boxShadow: '3px 4px 0 var(--ink)',
              }}>
              start creating →
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-sm font-sans-ui"
                style={{ color: 'var(--ink-light)' }}>
                <Icon size={13} style={{ color: 'var(--kraft-dark)' }}/> {text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Scrolling polaroid stack ──────────────────── */}
        <div
          className="hidden md:block overflow-hidden h-[520px]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
          <motion.div
            animate={{ y: [0, -SINGLE] }}
            transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
            className="flex flex-col gap-[14px]">
            {[...SAMPLE_CARDS, ...SAMPLE_CARDS].map((c, i) => (
              <div key={i} className="polaroid shadow-polaroid"
                style={{
                  transform: `rotate(${c.tilt})`,
                  background: c.color,
                  minHeight: CARD_H,
                  padding: '12px 12px 40px',
                  position: 'relative',
                }}>
                {/* Tape strip */}
                <div className={`tape-strip ${c.tape}`}
                  style={{ top: -9, left: '50%', transform: 'translateX(-50%) rotate(-1deg)' }}/>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <p className="font-handwritten text-xl" style={{ color: 'var(--ink)' }}>
                    {c.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="px-8 py-5 flex items-center justify-between flex-wrap gap-3"
        style={{ borderTop: '2px solid var(--kraft)', background: 'rgba(240,217,181,.4)' }}>
        <span className="font-handwritten text-lg" style={{ color: 'var(--ink-light)' }}>
          scrapbook. ✂️
        </span>
        <div className="flex items-center gap-3 font-typewriter text-xs"
          style={{ color: 'var(--ink-light)', opacity: .6 }}>
          <span style={{ background: 'var(--washi-lemon)', padding: '2px 8px', borderRadius: 3 }}>
            {VERSION}
          </span>
          <span>·</span>
          <span>&ldquo;{CODENAME}&rdquo;</span>
          <span>·</span>
          <span>{BUILD_DATE}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            live
          </span>
        </div>
      </footer>
    </main>
  )
}
