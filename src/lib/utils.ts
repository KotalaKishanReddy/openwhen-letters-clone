import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Bug fix: use twMerge so conflicting Tailwind classes resolve correctly
// e.g. cn('px-2', 'px-4') → 'px-4' instead of 'px-2 px-4'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => chars[b % chars.length])
    .join('')
}

export const CARD_COLORS: Record<string, { bg: string; label: string }> = {
  default:  { bg: '#ffffff',  label: 'White' },
  pink:     { bg: '#f9dde0',  label: 'Blush Pink' },
  yellow:   { bg: '#fef3c7',  label: 'Butter' },
  purple:   { bg: '#ede9fe',  label: 'Lavender' },
  sage:     { bg: '#d1fae5',  label: 'Sage' },
  midnight: { bg: '#1e1b4b',  label: 'Midnight' },
  custom:   { bg: '',         label: 'Custom…' }
}

export const BG_PATTERNS: Record<string, string> = {
  none:   'none',
  dots:   'radial-gradient(circle, rgba(61,44,30,.12) 1px, transparent 1px)',
  lines:  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(61,44,30,.05) 10px, rgba(61,44,30,.05) 11px)',
  hearts: 'none' // Handled via pseudo-CSS class
}

export const FONT_OPTIONS = [
  { value: 'serif', label: 'Serif (Elegant)', css: "'Instrument Serif', Georgia, serif" },
  { value: 'sans',  label: 'Sans (Clean)',    css: "'Inter', system-ui, sans-serif" },
  { value: 'mono',  label: 'Mono (Quirky)',   css: "'Courier New', monospace" }
]

export const STICKER_SETS = [
  '💕', '💌', '✨', '🌸', '🌟', '🎂', '😊', '👋',
  '💚', '💛', '💙', '💜', '🧡', '🔥', '❤️', '🌚',
  '🐮', '🍌', '🍩', '🌵', '🌈', '⚡', '🌊', '🦋'
]
