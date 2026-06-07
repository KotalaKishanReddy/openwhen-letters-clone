/**
 * Simple in-process rate limiter for auth endpoints.
 * Uses a sliding window counter per IP stored in a Map.
 * Good enough for a single-instance deployment (Vercel serverless).
 * For multi-region, swap this for Upstash Redis rate limiting.
 */

interface Window {
  count:     number
  resetAt:   number
}

const store = new Map<string, Window>()

export interface RateLimitResult {
  allowed:    boolean
  remaining:  number
  resetAt:    number
}

/**
 * @param key       IP address or any identifier
 * @param limit     Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000): RateLimitResult {
  const now    = Date.now()
  const entry  = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count++
  store.set(key, entry)

  return {
    allowed:   entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt:   entry.resetAt,
  }
}

// Prune stale entries every 30 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k)
  }
}, 30 * 60 * 1000)
