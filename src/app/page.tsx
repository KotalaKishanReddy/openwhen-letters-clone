'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Eye, Sparkles } from 'lucide-react'

const CARDS = [
  { label: "you're stressed",  color: 'bg-white' },
  { label: "you miss me",      color: 'bg-blush' },
  { label: "you need a laugh", color: 'bg-butter' },
  { label: "you're bored",     color: 'bg-lavender' },
  { label: "you get that job", color: 'bg-white' },
  { label: "it's your birthday", color: 'bg-blush' },
  { label: "you need a break", color: 'bg-sage' },
  { label: "it's 2030",        color: 'bg-lavender' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5
        bg-cream/90 backdrop-blur-md border-b border-brown/10">
        <span className="font-serif-display italic text-2xl text-brown">openwhen</span>
        <Link href="/admin/login"
          className="flex items-center gap-2 bg-brown text-cream px-5 py-2.5
            rounded-full text-sm font-medium hover:opacity-85 transition-opacity">
          <Lock size={14} /> admin
        </Link>
      </nav>

      {/* Hero */}
      <section className="grid md:grid-cols-2 items-center gap-12 px-8 md:px-16 py-20 min-h-[88vh]">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6 }}>
          <p className="text-xs uppercase tracking-widest text-brown-light mb-5">✉️ digital open when letters</p>
          <h1 className="font-serif-display text-5xl md:text-6xl text-brown leading-tight mb-6">
            letters written<br /><em className="text-blush-dark">just for you</em>
          </h1>
          <p className="text-brown-light text-lg leading-relaxed max-w-md mb-10">
            A private collection of heartfelt messages, crafted with love, opened at just the right moment.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/login"
              className="bg-brown text-cream px-7 py-3.5 rounded-full font-medium hover:opacity-85 transition-all hover:-translate-y-0.5">
              open admin →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-brown-light">
            <span className="flex items-center gap-1.5"><Lock size={13}/> password protected</span>
            <span className="flex items-center gap-1.5"><Eye size={13}/> view-only share link</span>
            <span className="flex items-center gap-1.5"><Sparkles size={13}/> fully customisable</span>
          </div>
        </motion.div>

        {/* Scrolling cards */}
        <div className="hidden md:block overflow-hidden h-[480px]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
          <motion.div
            animate={{ y: [0, -50 * CARDS.length] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="flex flex-col gap-3.5">
            {[...CARDS, ...CARDS].map((c, i) => (
              <div key={i} className={`${c.color} rounded-2xl px-6 py-5 border border-brown/10 shadow-card`}>
                <p className="text-xs uppercase tracking-widest text-brown-light mb-1">open when...</p>
                <p className="font-serif-display italic text-xl text-brown">{c.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
