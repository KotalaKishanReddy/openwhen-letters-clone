/* ═══════════════════════════════════════════
   PACK.JS — Bundle pages + photos → .scrap file
═══════════════════════════════════════════ */

// .scrap file format (binary):
// [4 bytes] magic: 0x53435250 ('SCRP')
// [1 byte]  version: 0x01
// [16 bytes] salt
// [12 bytes] iv
// [remaining] AES-256-GCM ciphertext

// TODO: pack(projectJSON, passphrase) → Uint8Array (.scrap)
// TODO: unpack(uint8array, passphrase) → projectJSON
// TODO: downloadScrap(packed, filename)
// TODO: validateMagic(uint8array) → boolean

export default {};
