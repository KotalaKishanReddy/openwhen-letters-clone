# 💌 Scrapbook Letter Studio

A top-tier digital scrapbook editor with end-to-end encrypted letter sharing.

## Features (building in progress)
- [ ] Canva-style drag-and-drop canvas editor
- [ ] Full sticker library (florals, bows, hearts, stamps, ephemera)
- [ ] Paper textures (cream, rose, kraft, linen, vintage)
- [ ] Washi tape, wax seals, torn edges, polaroid frames
- [ ] Rich text with 30+ fonts
- [ ] Photo upload + collage tools
- [ ] Multi-page spreads
- [ ] Pinterest-style mood board
- [ ] AES-256-GCM encryption → `.scrap` download
- [ ] Shareable decrypt viewer

## File Structure
```
index.html          ← App shell
manifest.json       ← PWA manifest
sw.js               ← Service worker
src/
  css/              ← Modular stylesheets
  js/               ← Feature modules
  assets/           ← Stickers, textures, fonts
  components/       ← HTML partials
```

## Build Order
1. tokens.css + base.css
2. editor.js + drag.js (canvas core)
3. text.js + photo.js + stickers.js (element types)
4. paper.js + tape.js + shapes.js (decoration)
5. crypto.js + pack.js + export.js (encryption)
6. viewer.js (reader/decrypt)
7. pinterest.js + pages.js + layers.js (advanced)
8. Full polish pass
