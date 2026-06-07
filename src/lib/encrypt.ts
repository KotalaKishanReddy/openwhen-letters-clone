/**
 * AES-256-GCM encryption using Web Crypto API.
 * Key is derived from ENCRYPTION_KEY env var (separate from JWT_SECRET).
 * No fallback — if the key is missing the app throws at startup (see env.ts).
 */
import { env } from './env'

const ALG = 'AES-GCM'

/**
 * Derives a 256-bit AES-GCM key from the hex ENCRYPTION_KEY using HKDF-SHA-256.
 * HKDF ensures the raw key bytes are properly stretched and domain-separated.
 */
async function getKey(): Promise<CryptoKey> {
  const rawHex  = env.ENCRYPTION_KEY                                    // 64 hex chars = 32 bytes
  const rawBytes = Uint8Array.from(rawHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))

  const baseKey = await crypto.subtle.importKey(
    'raw', rawBytes, 'HKDF', false, ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name:  'HKDF',
      hash:  'SHA-256',
      salt:  new TextEncoder().encode('openwhen-letter-content-v1'),
      info:  new TextEncoder().encode('aes-gcm-256'),
    },
    baseKey,
    { name: ALG, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptText(plaintext: string): Promise<string> {
  const key = await getKey()
  const iv  = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALG, iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  // Pack: [4-byte version][12-byte IV][ciphertext]
  const version  = new Uint8Array([0, 0, 0, 1])          // v1 — allows future key rotation
  const combined = new Uint8Array(4 + 12 + ciphertext.byteLength)
  combined.set(version, 0)
  combined.set(iv, 4)
  combined.set(new Uint8Array(ciphertext), 16)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptText(cipherB64: string): Promise<string> {
  const key   = await getKey()
  const bytes = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0))
  // Skip 4-byte version header
  const iv   = bytes.slice(4, 16)
  const data = bytes.slice(16)
  const plain = await crypto.subtle.decrypt({ name: ALG, iv }, key, data)
  return new TextDecoder().decode(plain)
  // Let caller handle errors — don't swallow decrypt failures silently
}
