/**
 * Centralised environment variable validation.
 * Import this at the top of any server-only module that needs env vars.
 * Throws at startup (build or cold-start) so misconfiguration is caught immediately.
 */

const REQUIRED_SERVER = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
] as const

function validateEnv() {
  const missing: string[] = []
  for (const key of REQUIRED_SERVER) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key)
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `[openwhen] Missing required environment variables:\n` +
      missing.map(k => `  - ${k}`).join('\n') +
      `\n\nSet these in Vercel → Project Settings → Environment Variables (or .env.local locally).`
    )
  }

  // JWT_SECRET must be at least 32 chars
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('[openwhen] JWT_SECRET must be at least 32 characters long.')
  }

  // ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY!)) {
    throw new Error(
      '[openwhen] ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).\n' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
}

// Only validate in server context (not during client-side bundling)
if (typeof window === 'undefined') {
  validateEnv()
}

export const env = {
  SUPABASE_URL:          process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY:     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_KEY:  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  JWT_SECRET:            process.env.JWT_SECRET!,
  ENCRYPTION_KEY:        process.env.ENCRYPTION_KEY!,
  SETUP_SECRET:          process.env.SETUP_SECRET ?? '',
  SETUP_DISABLED:        process.env.SETUP_DISABLED === 'true',
  IS_PRODUCTION:         process.env.NODE_ENV === 'production',
}
