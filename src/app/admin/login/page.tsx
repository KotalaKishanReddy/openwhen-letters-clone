'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Scissors, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]             = useState({ username: '', password: '' })
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const [error, setError]           = useState('')

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
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Welcome to your studio ✂️')
        router.push('/admin/dashboard')
        router.refresh()
      } else if (res.status === 429) {
        const headerVal = res.headers.get('Retry-After')
        const secs = headerVal ? parseInt(headerVal, 10) : (data.retryAfter ?? 900)
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
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-md">

        {/* ── Decorative top tape ── */}
        <div className="flex justify-center mb-0 relative">
          <div className="tape-strip pink" style={{ position:'relative', top:9, left:0, transform:'rotate(-2deg)', zIndex:10 }}/>
          <div className="tape-strip sage" style={{ position:'relative', top:6, left:8, transform:'rotate(1.5deg)', zIndex:10 }}/>
        </div>

        {/* ── Login card (polaroid) ── */}
        <div className="polaroid shadow-polaroid" style={{ padding: '32px 32px 48px' }}>

          <div className="text-center mb-8">
            <div className="text-5xl mb-3 select-none">✂️</div>
            <h1 className="font-handwritten text-4xl font-bold" style={{ color: 'var(--ink)' }}>
              open studio
            </h1>
            <p className="font-typewriter text-xs mt-1.5" style={{ color: 'var(--ink-light)', opacity: .6 }}>
              creator access only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg px-4 py-3"
                style={{ background: '#fde8e8', border: '1.5px solid #f5a5a5' }}>
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <div className="font-handwritten text-base" style={{ color: '#b91c1c' }}>
                  {error}
                  {retryAfter > 0 && (
                    <span className="block font-typewriter text-xs mt-0.5" style={{ color: '#b91c1c', opacity:.7 }}>
                      {mins}:{String(secs).padStart(2,'0')} remaining
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-handwritten text-base" style={{ color: 'var(--ink-light)' }}>username</label>
              <input
                type="text" required autoFocus autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                disabled={retryAfter > 0 || loading}
                placeholder="your username"
                className="input-field disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-handwritten text-base" style={{ color: 'var(--ink-light)' }}>password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={retryAfter > 0 || loading}
                  placeholder="••••••••"
                  className="input-field pr-11 disabled:opacity-50"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition"
                  style={{ color: 'var(--ink-light)' }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit"
              disabled={loading || retryAfter > 0}
              className="font-handwritten text-lg py-3.5 rounded-lg transition hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'var(--ink)',
                color: 'var(--paper)',
                boxShadow: '3px 4px 0 var(--kraft-dark)',
              }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"/> snipping in...</>
              ) : retryAfter > 0 ? (
                `locked — ${mins}:${String(secs).padStart(2,'0')}`
              ) : (
                <><Scissors size={15}/> enter studio</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-typewriter text-xs mt-5" style={{ color: 'var(--ink-light)', opacity:.35 }}>
          bcrypt · JWT · AES-256-GCM
        </p>
      </div>
    </main>
  )
}
