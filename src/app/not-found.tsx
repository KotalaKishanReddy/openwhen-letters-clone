import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6">💌</div>
      <h1 className="font-serif-display italic text-4xl text-brown mb-4">this letter got lost</h1>
      <p className="text-brown-light mb-8 max-w-sm">
        The page you're looking for doesn't exist — maybe it was moved or never written.
      </p>
      <Link href="/"
        className="bg-brown text-cream px-7 py-3.5 rounded-full font-medium hover:opacity-85 transition">
        ← back to home
      </Link>
    </main>
  )
}
