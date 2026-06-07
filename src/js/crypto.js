/* ═══════════════════════════════════════════
   CRYPTO.JS — AES-256-GCM + PBKDF2
═══════════════════════════════════════════ */

// Uses Web Crypto API (window.crypto.subtle) — no external deps

// TODO: deriveKey(passphrase, salt) → CryptoKey via PBKDF2
//   - iterations: 310000
//   - hash: SHA-256
//   - keyUsage: encrypt, decrypt

// TODO: encrypt(plaintext: Uint8Array, passphrase: string)
//   → { ciphertext, salt, iv } all as Uint8Array

// TODO: decrypt(ciphertext, passphrase, salt, iv)
//   → plaintext Uint8Array

// TODO: encryptString(str, passphrase) → base64 bundle
// TODO: decryptString(base64bundle, passphrase) → string

export default {};
