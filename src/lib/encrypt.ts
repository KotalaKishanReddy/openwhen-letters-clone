// AES-GCM encryption for letter content using Web Crypto API
// Key is derived from JWT_SECRET so content is useless without it

const ALG = 'AES-GCM'

async function getKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(
    (process.env.JWT_SECRET || 'fallback-dev-key-change-me').slice(0, 32).padEnd(32, '0')
  )
  return crypto.subtle.importKey('raw', raw, ALG, false, ['encrypt', 'decrypt'])
}

export async function encryptText(plaintext: string): Promise<string> {
  const key = await getKey()
  const iv  = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALG, iv },
    key,
    enc.encode(plaintext)
  )
  // Return iv + ciphertext as base64
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptText(cipherB64: string): Promise<string> {
  try {
    const key = await getKey()
    const bytes = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0))
    const iv    = bytes.slice(0, 12)
    const data  = bytes.slice(12)
    const plain = await crypto.subtle.decrypt({ name: ALG, iv }, key, data)
    return new TextDecoder().decode(plain)
  } catch {
    return '' // Return empty if decryption fails
  }
}
