'use client'
import { HexColorPicker } from 'react-colorful'
import { useState, useRef, useEffect } from 'react'

export default function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 border border-brown/15 rounded-xl px-3 py-2 bg-cream hover:border-brown/30 transition">
        <span className="w-5 h-5 rounded-full border border-brown/20 shrink-0"
          style={{ background: value }} />
        <span className="text-xs text-brown-light font-mono">{value}</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-2 bg-white rounded-xl shadow-lift border border-brown/10 p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <input value={value} onChange={e => onChange(e.target.value)}
            className="mt-2 w-full border border-brown/15 rounded-lg px-2 py-1.5 text-xs font-mono text-brown focus:outline-none" />
        </div>
      )}
    </div>
  )
}
