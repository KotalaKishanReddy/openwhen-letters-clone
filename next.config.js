/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options',           value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          // Referrer control — don't leak full URL to third parties
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed by this app
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Force HTTPS for 1 year (including subdomains)
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          // - default-src 'self'                → only load resources from own origin
          // - script-src 'self' 'unsafe-inline'  → Next.js needs inline scripts for hydration
          // - style-src 'self' 'unsafe-inline'   → Tailwind inline styles
          // - img-src *                           → user-uploaded images from any https host
          // - connect-src 'self' *.supabase.co   → Supabase API calls
          // - frame-ancestors 'none'             → belt-and-suspenders against framing
          {
            key:   'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
