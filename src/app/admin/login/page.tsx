'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Welcome back 💌')
        router.push('/admin/dashboard')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-5xl">💌</span>
          <h1 className="font-serif-display italic text-4xl text-brown mt-4">openwhen</h1>
          <p className="text-brown-light mt-2 text-sm">admin access only</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-brown/10 shadow-card p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brown uppercase tracking-wide">username</label>
            <input
              type="text" required autoFocus
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="border border-brown/15 rounded-xl px-4 py-3 text-sm text-brown
                focus:outline-none focus:border-blush-dark focus:ring-2 focus:ring-blush/30 bg-cream"
              placeholder="your username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brown uppercase tracking-wide">password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-brown/15 rounded-xl px-4 py-3 pr-10 text-sm text-brown
                  focus:outline-none focus:border-blush-dark focus:ring-2 focus:ring-blush/30 bg-cream"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown">
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="bg-brown text-cream rounded-full py-3.5 font-medium text-sm
              hover:opacity-85 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'signing in...' : <><Lock size={14}/> sign in</>}
          </button>
        </form>

        <p className="text-center text-xs text-brown-light mt-6 opacity-50">
          protected with bcrypt + JWT · AES-256-GCM encrypted content
        </p>
      </div>
    </main>
  )
}
