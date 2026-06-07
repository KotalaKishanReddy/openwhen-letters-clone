/* ═══════════════════════════════════════════
   SERVICE WORKER — Offline support
═══════════════════════════════════════════ */
const CACHE = 'scrapbook-v1';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
);

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
);
