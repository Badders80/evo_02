# CONTINUE — evo_02

**Date:** 2026-08-21  
**Baseline:** GitHub `Badders80/evo_02` `main` (identity lock + stills + Barbara portrait)  
**SSOT lock:** `evo_00/doc/ASSET_LOCK.md`

---

## Layers

| Layer | Status | Blocker? |
|---|---|---|
| **Backend** (engines + roster lock) | Proceed | No |
| **Middle** (Supabase, Stripe, vault) | Stubs | Yes for real money |
| **Front** (website) | Nellie copy + stills live | No for display |
| **MC** | Messy xAI skin, not SSOT | **Park — not a blocker** |

---

## Antigravity blast radius

**Identity / data: cleaned.** Live code no longer has Te Akau, Sharrock, Marsh, Alex Bax, or Barbara-as-Stephen-Gray. Pedigrees locked. Checkout closed except Nellie (`listed`). First Gear visible completed.

**Not cleaned (park, don’t reopen in Sprint 1):**
- Mission Control UI restyle + duplicate `INITIAL_HORSES` (operator desk only)
- `/home/evo/workspace/website_cloner` on **:3005** (sandbox, not this repo)
- Checkout still has `usr_guest_demo` + `sha256_placeholder` — that’s unfinished middle, not a fake horse

**Do not execute** the old “full-loop all horses + Mulan $65” plan. It fights the lock.

---

## Next sprint goal

**Nellie end-to-end, one real buyer.** Then bring the others in.

Must include: Supabase auth (no guest) → KYC verified → `reserve_campaign_shares` RPC → Stripe test pay → webhook `holdings` + real hashes → `/mystable` shows that row.

Everyone else stays **visible, not buyable**.

---

## Nellie assets (ready)

- Soft copy: `apps/web/src/lib/horses-data.ts` → PDP, `/about`, PDS §2
- Stills: `public/horses/nellie/01.png` cover, `02.webp`–`06.webp` gallery
- Trainer: `public/trainers/barbara-kennedy.png`

Convention going forward: image dumps are `01`, `02`, `03`… **01 = cover**.
