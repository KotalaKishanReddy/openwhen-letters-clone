# openwhen — personal open when letters

A private, full-stack **Next.js 14 + Supabase** app for sending digital open when letter collections to someone you love.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + RLS) |
| Auth | bcrypt + JWT (jose) + HttpOnly cookies |
| Encryption | AES-256-GCM (Web Crypto API) |
| Editor | TipTap rich text |
| Styling | Tailwind CSS + framer-motion |
| Deploy | Vercel |

## Security Architecture

- 🔒 **Admin** — bcrypt-hashed password, JWT session in HttpOnly cookie (8h expiry), middleware-level route protection
- 🔐 **Letter content** — AES-256-GCM encrypted at rest in Supabase, decrypted only server-side
- 👁️ **Share link** — view-only `/view/[slug]`, no edit endpoints exposed, read-only RLS policies
- 🛡️ **Row Level Security** — anon can only read published collections/letters; service role for all writes

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/KotalaKishanReddy/openwhen-letters-clone.git
cd openwhen-letters-clone
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → paste and run `supabase/schema.sql`
3. Copy your Project URL and keys

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=<64-char random string>
SETUP_SECRET=<any secret for first-time setup>
```

### 4. Run locally

```bash
npm run dev
```

### 5. Create admin account (one time)

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"yourpassword","secret":"your-setup-secret"}'
```

> ⚠️ After running this once, delete `src/app/api/admin/setup/route.ts` from the repo.

### 6. Deploy to Vercel

1. Push to GitHub (already done ✔)
2. [vercel.com/new](https://vercel.com/new) → import repo
3. Add all env vars from `.env.local` in Vercel dashboard
4. Deploy!

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── dashboard/              # Manage collections
│   │   └── editor/[id]/            # Rich letter editor
│   ├── view/[slug]/               # Read-only share page
│   └── api/
│       ├── auth/login|logout       # Session management
│       ├── collections/            # CRUD collections
│       ├── collections/[id]/letters # Add letters
│       ├── letters/[id]            # Edit/delete letters
│       └── admin/setup             # One-time admin setup
├── components/
│   ├── RichEditor.tsx             # TipTap editor
│   └── ColorPicker.tsx            # HexColorPicker widget
└── lib/
    ├── auth.ts                    # JWT sign/verify
    ├── encrypt.ts                 # AES-256-GCM
    ├── utils.ts                   # Helpers, constants
    ├── types.ts                   # TypeScript types
    └── supabase/client|server.ts  # Supabase clients
```

## Usage

1. Go to `/admin/login` → sign in
2. Create a new collection → name it, set recipient, pick colors/font
3. Add letters → write rich content, pick card styles, add stickers
4. Publish the collection → copy the share link
5. Send the link to your sister 💛 — she gets view-only access
