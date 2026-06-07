'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Eye, Sparkles, Heart } from 'lucide-react'

// ── Version manifest ──────────────────────────────────────────────────────────
// Each release gets a codename. Update VERSION + CODENAME on every release.
const VERSION    = 'v1.3.0'
const CODENAME   = 'Sealed with Care'
const BUILD_DATE = 'Jun 7 2026'
// ─────────────────────────────────────────────────────────────────────────────

const CARDS = [
  { label: "you're stressed",         color: '#ffffff' },
  { label: "you miss me",              color: '#f9dde0' },
  { label: "you need a laugh",         color: '#fef3c7' },
  { label: "you're bored",             color: '#ede9fe' },
  { label: "you got that job! 🎉",     color: '#ffffff' },
  { label: "it's your birthday 🎂",    color: '#f9dde0' },
  { label: "you need a break",         color: '#d1fae5' },
  { label: "it's 3 am",                color: '#ede9fe' },
  { label: "you feel lonely",          color: '#fef3c7' },
  { label: "you're proud of yourself", color: '#d1fae5' },
]

const FEATURES = [
  { icon: Lock,     text: 'Password-protected admin' },
  { icon: Eye,      text: 'View-only share link' },
  { icon: Sparkles, text: 'Rich letter editor' },
  { icon: Heart,    text: 'Fully customisable' },
]

const CARD_HEIGHT   = 112
const CARD_GAP      = 12
const SINGLE_HEIGHT = CARDS.length * (CARD_HEIGHT + CARD_GAP)

export default function Home() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5
        bg-cream/90 backdrop-blur-md border-b border-brown/10">
        <div className="flex items-center gap-2.5">
          <span className="font-serif-display italic text-2xl text-brown select-none">openwhen</span>
          <span
            title={`${VERSION} — ${CODENAME}`}
            className="text-[10px] font-mono text-brown/30 bg-brown/5 px-2 py-0.5 rounded-full cursor-default">
            {VERSION}
          </span>
        </div>
        <Link href="/admin/login"
          className="flex items-center gap-2 bg-brown text-cream px-5 py-2.5
            rounded-full text-sm font-medium hover:opacity-85 transition-opacity">
          <Lock size={13}/> admin
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 grid md:grid-cols-2 items-center gap-12 px-8 md:px-16 py-20 min-h-[88vh]">
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>

          <p className="text-xs uppercase tracking-widest text-brown-light mb-6 select-none">
            ✉️ digital open when letters
          </p>

          <h1 className="font-serif-display text-5xl md:text-6xl text-brown leading-[1.08] mb-6">
            letters written<br />
            <em className="text-blush-dark italic">just for you</em>
          </h1>

          <p className="text-brown-light text-lg leading-relaxed max-w-md mb-10">
            Craft a private collection of heartfelt messages — each one waiting
            to be opened at exactly the right moment.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/admin/login"
              className="bg-brown text-cream px-7 py-3.5 rounded-full font-medium
                hover:opacity-85 transition-all hover:-translate-y-0.5 shadow-card">
              open admin →
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-sm text-brown-light">
                <Icon size={13}/> {text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Scrolling card stack */}
        <div
          className="hidden md:block overflow-hidden h-[500px]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)' }}>
          <motion.div
            animate={{ y: [0, -SINGLE_HEIGHT] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            className="flex flex-col gap-3">
            {[...CARDS, ...CARDS].map((c, i) => (
              <div key={i}
                className="rounded-2xl px-6 py-5 border border-brown/10 shadow-card"
                style={{ background: c.color }}>
                <p className="text-xs uppercase tracking-widest text-brown-light mb-1 select-none">
                  open when...
                </p>
                <p className="font-serif-display italic text-xl text-brown">{c.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer / version stamp */}
      <footer className="border-t border-brown/8 px-8 py-5 flex items-center justify-between flex-wrap gap-3">
        <span className="font-serif-display italic text-brown/40 text-sm select-none">openwhen 💌</span>
        <div className="flex items-center gap-3 text-xs text-brown/30 font-mono select-none">
          <span
            title={CODENAME}
            className="bg-brown/5 px-2.5 py-1 rounded-full cursor-default">
            {VERSION}
          </span>
          <span>·</span>
          <span className="italic opacity-70">&ldquo;{CODENAME}&rdquo;</span>
          <span>·</span>
          <span>deployed {BUILD_DATE}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            live
          </span>
        </div>
      </footer>

    </main>
  )
}
