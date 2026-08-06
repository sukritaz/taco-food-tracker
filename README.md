# Cat Food Tracker 🐱

Shared web app to log how much the cat eats (wet + dry), see a calendar of daily
intake, chart food + weight over time, and share one private link with flatmates.
Phone-first. No accounts — access is via one secret household link.

## How it works

- **Log** feeds: pick wet/dry, amount, unit (scoop / pouch / grams), optional "fed by".
- **Calendar**: each day shows total; tap a day to see every entry.
- **Charts**: food per day (dry + wet in grams) and weight over time.
- **Weight**: log weigh-ins; no target, just the trend.
- **Settings**: cat name, gram-conversion factors (1 scoop = ? g, 1 pouch = ? g),
  optional daily target, and the shareable link.

Raw entries are stored exactly as logged ("1 scoop" stays "1 scoop"). The **Raw / Grams**
toggle only changes the *view*; grams are computed from the Settings factors.

## Privacy model

No logins. The secret slug in the URL (`/h/<key>`) is the only key to the data.
Anyone with the link can log — that's intentional (low friction = more logging).
It is **not** public: the URL isn't indexed and the DB is only reachable through
server routes that hold the secret service key. Treat the link like a password —
don't post it publicly. Want stronger later? Add a shared password gate.

## Setup (one time, ~10 min, free)

### 1. Supabase (shared database)

1. Create a project at https://supabase.com (free tier).
2. In the dashboard: **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), **Run**.
3. Pick your own household key: in `schema.sql` replace `taco-home-CHANGEME`
   with a random secret (e.g. `taco-home-7hk2p9qx`) before running, or update the
   row later. That value is your household key / share link.
4. **Project Settings → API Keys**: copy the **Project URL** and the **secret** key (`sb_secret_…`, formerly service_role).

### 2. Local env

```bash
cp .env.local.example .env.local
# then edit .env.local:
#   SUPABASE_URL=https://<your-project>.supabase.co
#   SUPABASE_SECRET_KEY=<secret key, sb_secret_...>
```

### 3. Run locally

```bash
npm install
npm run dev
# open http://localhost:3000/h/taco-home-7hk2p9qx   (your key)
```

## Deploy + share (Vercel, free)

1. Push this repo to GitHub.
2. Import it at https://vercel.com (free Hobby plan).
3. Add the two env vars (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`)
   in Vercel **Project → Settings → Environment Variables**.
4. Deploy. Your link is `https://<app>.vercel.app/h/<your-key>`.
5. Send that link to your 3 flatmates. Done — everyone logs from their phone.

Tip: on iPhone/Android, open the link → **Add to Home Screen** for an app-like icon.

## Phase 2 — NFC tap

Write your share URL (`https://<app>.vercel.app/h/<your-key>`) to an NFC tag using
any "NFC Tools" app. Tapping it opens the Log page straight away. No code change needed.

Optional pre-fill (later): the log form could read query params like
`?food=dry&unit=scoop&amount=1` so a tap logs a preset in one action — say the word
and it's a small addition.

## Stack

Next.js 16 (App Router) · Supabase (Postgres) · Tailwind v4 · Recharts. Cost: $0.
