# PASS 2 — Content Curation Sweep (founder-guided, subtractive only)

**Status: READY — hand to founder. Do not execute without founder in the loop.**
**Branch:** `design-alignment` · Pass 1 complete: `2c6ba07` → `acec420`, `just check` 10/10.
**Rule:** subtractive only. Nothing new gets added. You point, we remove/relocate.

---

## How this works (15–20 min of your time)

1. Open http://localhost:3010 (`cd /home/evo/new/evo_02 && pnpm --filter @evo/web dev -p 3010`).
2. Walk the surfaces below. For each, mark: **KEEP / CUT / MOVE**.
3. Hand the list back — execution is minutes per item because every surface
   is primitive-built now; sections are self-contained and delete cleanly.

## Surfaces & the questions to ask

### 1. Landing page (`/`) — ported from evo_01
- Hero (TypeWriter tagline, gold lockup, horse-double background)
- About · How It Works · Digital Syndication · Marketplace teaser
- Press showcase + partner logo carousel
- FAQ (9 items from `src/dna/content/faq.json`)
- CTA lead modal (email capture → `/api/subscribe` → leads table + SMTP notify)
- **Ask:** any sections you don't want public? Any FAQ items stale? Partner
  logos to drop (Tokinvest logos are still in the tree — flag if unwanted)?

### 2. Horse detail (`/horses/nellie`) + about tab
- Hero conformation image, pedigree, performance, trainer block
- Pricing card (upfront vs subscription_float), cap table, data room
- **Ask:** is everything on the page wanted? Media fallback behaviour OK?

### 3. Legal/commercial cards (horse page)
- Pricing card — GST-inclusive note, fee split display (5% evo + 3% processing)
- Cap-table card — sold/reserved/available split with status colours
- Data-room card — PDS/SA download links
- **Ask:** keep all three cards? Order? Any figures shown you don't want public?

### 4. MyStable (light console — needs a login to see)
- Holdings table, feed, vault, billing tabs; KYC status chip; sign-out
- **Ask:** tabs to cut? Any card you don't want in v1?

### 5. Login (`/login`)
- Magic-link + password modes. Keep both or magic-link only?

### 6. Static pages — privacy, terms, faq, learn/returns
- **Ask:** privacy/terms stay as-is (legal)? Learn/returns keep?

## Guardrails (unchanged)

- KYC owner list for First Gear = track-record only. No cap-table detail needed.
- Nellie is the only buyable horse. Others visible, not buyable — that stays.
- Tokinvest horses = `upfront` terminology. Never 'one_time'.
- Owner/lessor = "Evolution Stables" — never Ltd/Bloodstock.

## After Pass 2

Content locked → merge `design-alignment` → main → founder-only Vercel cutover
(root dir `apps/web`) → verify `/horses/nellie` 200 in prod → archive evo_01
website surface. Payouts remain v2. Mission Control restyle stays locked.

## Session log (Pass 1)

- `2c6ba07` W1+W2 — tokens + primitives + landing data/images/deps
- `b54e862` leads plumbing (00007 migration, db_models types, /api/subscribe)
- `45796d2` W3a — landing replication (NavBar/Footer/CtaLeadModal/8 sections/FAQ→CollapsePanel/auth adapter)
- `7098055` W3b — token sweep of all app surfaces (hex → semantic tokens)
- `acec420` W4 — MyStable light console scope + status tokens
- Gate: `just check` → 10/10 PASS. Dev verified: / 200, /horses/nellie 200,
  /mystable→/login 200, NavBar/footer/gold lockup server-rendering.

Known notes for Pass 2 (not blockers):
- `horses-data.ts` publish-payload still carries legacy ignored `totalShares/sharesAvailable` fields (pre-existing, documented non-blocker).
- Nav "Marketplace" points at `/marketplace` — that route is home-anchored (`/#marketplace` candidate) — decide in Pass 2.
- Footer "The Future of Ownership" hero block duplicates landing hero copy — candidate for Pass 2 cut.
- `text-[#d4a964]`-era `font-serif italic` accents retained (evo_01 signature style).