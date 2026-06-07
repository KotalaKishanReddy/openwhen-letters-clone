'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const [error, setError] = useState('')

  // Countdown for rate-limit lockout
  useEffect(() => {
    if (retryAfter <= 0) return
    const t = setInterval(() => setRetryAfter(n => Math.max(0, n - 1)), 1000)
    return () => clearInterval(t)
  }, [retryAfter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (retryAfter > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Welcome back 💌')
        router.push('/admin/dashboard')
        router.refresh()
      } else if (res.status === 429) {
        const secs = parseInt(res.headers.get('Retry-After') || '900', 10)
        setRetryAfter(secs)
        setError(`Too many attempts. Try again in ${Math.ceil(secs / 60)} min.`)
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const mins = Math.floor(retryAfter / 60)
  const secs = retryAfter % 60

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4 select-none">💌</div>
          <h1 className="font-serif-display italic text-4xl text-brown">openwhen</h1>
          <p className="text-brown-light mt-2 text-sm">admin access only</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-brown/10 shadow-card p-8 flex flex-col gap-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm text-red-600">
                {error}
                {retryAfter > 0 && (
                  <span className="block text-xs text-red-400 mt-0.5 font-mono">
                    {mins}:{String(secs).padStart(2,'0')} remaining
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brown uppercase tracking-wide">username</label>
            <input
              type="text" required autoFocus autoComplete="username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="border border-brown/15 rounded-xl px-4 py-3 text-sm text-brown
                focus:outline-none focus:border-blush-dark focus:ring-2 focus:ring-blush/30 bg-cream
                transition disabled:opacity-50"
              disabled={retryAfter > 0 || loading}
              placeholder="your username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brown uppercase tracking-wide">password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-brown/15 rounded-xl px-4 py-3 pr-11 text-sm text-brown
                  focus:outline-none focus:border-blush-dark focus:ring-2 focus:ring-blush/30 bg-cream
                  transition disabled:opacity-50"
                disabled={retryAfter > 0 || loading}
                placeholder="••••••••"
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown p-1">
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <button type="submit"
            disabled={loading || retryAfter > 0}
            className="bg-brown text-cream rounded-full py-3.5 font-medium text-sm
              hover:opacity-85 transition-all flex items-center justify-center gap-2
              disabled:opacity-40 disabled:cursor-not-allowed">
            {loading
              ? <><span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin"/> signing in...</>
              : retryAfter > 0
              ? `locked — ${mins}:${String(secs).padStart(2,'0')}`
              : <><Lock size={14}/> sign in</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-brown-light mt-6 opacity-40 select-none">
          bcrypt · JWT · AES-256-GCM
        </p>
      </div>
    </main>
  )
}
