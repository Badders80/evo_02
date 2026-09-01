# PLAN — Horse Page LEFT/RIGHT build (prod-parity base)

## Goal (one sentence)
Rebuild `/marketplace/[slug]` as the prod-pattern horse page — LEFT (⅔) horse info with media deck, story, 5 tabs; RIGHT (⅓) sticky status-driven investment rail — per `build-loop/page-model-notes.md`.

## Approach
- Prod page (`/marketplace/[slug]` on 02_website) is the base template; founder deltas recorded in the notes doc are applied on top.
- New route `apps/web/src/app/marketplace/[slug]/page.tsx`; `/horses/[slug]` becomes a redirect (compat + sitemap).
- Data: inventory jsonb (already MC-fed) + one-time migration of rich pedigree/race data from evo_01 into local supabase (dev surface only; prod application stays founder-gated at cutover).

## Tech constraints
- pnpm from repo root ONLY (`export PNPM_HOME` + PATH). Gate: `just check` = lint+typecheck+test, 10/10.
- Tokens only (no ad-hoc hex); dot-grid 3%; CUT=hide rule (CUT means "don't show", never delete logic). Canonical names: Evolution Stables; Wexford Stables; TML slug `tml-x-yearn` [verified: Justfile laws + CONTINUE.md].
- Money kill-switch untouched; no PURCHASES_ENABLED changes.

## Verified assumptions
- Route dir exists: `apps/web/src/app/horses/[slug]/page.tssx`→`page.tsx` (295 lines) and `apps/web/src/app/marketplace/page.tsx` [verified: ls]
- `formatHorseDisplayName`, `getCampaignMedia`, `getAllCampaigns` in `apps/web/src/lib/horses-data.ts:67,262` [verified: read]
- `HORSE_STILLS`, `MARKETPLACE_CARD_IMAGE`, `TRAINER_PORTRAITS`, `getTrainerCdnUrls` in `packages/storage/src/cdn.ts` [verified: read]
- LogoCarousel primitive: `apps/web/src/components/ui/LogoCarousel.tsx` [verified: find]
- CtaLeadModal overlay pattern: `apps/web/src/components/CtaLeadModal.tsx` [verified: read]
- Press carousel pattern: `PressShowcaseSection.tsx:410-420` [verified: read]
- Rich pedigree payload: `/home/evo/new/evo_01/02_website/src/data/pedigrees.json` — 4-gen verified for all 6 horses (sire_line/dam_line/cross_line, loveracing ids) [verified: python read]
- Race logs: `/home/evo/new/evo_01/02_website/src/data/horses.json` `race_log` — first-gear ×2, prudentia ×6, others empty [verified: python read]
- Trainers socials fields exist in prod trainers.json for all 4 stables; today only Logan filled; Byerley x_url WRONG (points at Logan) — logged as data-hygiene task, not blocking (render only existing links) [verified: python read]
- 3 horses have zero `marketing.highlights` — overview tab renders gracefully empty; MC authoring is a later task [verified: DB query]
- evo_02 inventory: `pedigree_data` jsonb flat-3gen complete; no race_log column yet [verified: DB query]

## Chunks (see plan-graph.json for nodes/edges)
1. **skeleton** — `/marketplace/[slug]` page + LEFT/RIGHT grid (LEFT 2fr / RIGHT 1fr default — founder calls ratio at Gate 1; one-token swap), sticky RIGHT shell with status-driven placeholder, redirect `/horses/[slug]`→`/marketplace/[slug]`, repoint marketplace card links.
2. **media-deck** — cover w/ arrows, contain discipline, spec strip (Sex/Colour/Sire/Dam), thumb carousel (LogoCarousel mechanics), video slide: play badge thumb, muted autoplay after 1s on arrival, pause off-slide, thumb-click lightbox (CtaLeadModal pattern).
3. **story** — THE STORY eyebrow + status chip + `Meet {Legal} aka {Nick}` + about/trainerBio woven paragraphs.
4. **tabs-overview-docs** — tab shell; OVERVIEW = highlights + racing outlook (L3); DOCUMENTS = PDS/SA cards with guest gating (blur + "Restricted: Investors Only", prod pattern).
5. **data-migration** — pedigrees.json → `inventory.pedigree_data` 4-gen fields; race_log → new jsonb field (local supabase seed update; prod migration founder-gated).
6. **tab-pedigree** — Matrix sub-tabs + linebreeding banner + 4-gen tree + footer strip + FULL BREEDING RECORD ↗ (port prod pedigree-tree pattern).
7. **tab-race** — computed summary (W/P from results), status-aware empty copy, BREEDING RECORD ↗ + FULL NZTR RECORD ↗ from loveracing ids.
8. **tab-trainer** — bio paragraphs + website/socials icon row (footer icon set; render-only-existing).
9. **rail-contents** — status-driven RIGHT: listed → Become-Owner CTA + View-Investment-Terms (opens terms surface); fully_subscribed → gold badge + keen-to-hear CTA. (Deeper commercial cards = RIGHT planning phase 2, not this cycle.)
10. **gate** — just check + build + manual walk (curl 200s), then kimi audit (Stage 5).

## Out of scope (this cycle)
- RIGHT-rail commercial depth beyond prod parity (pricing card layout decisions) — RIGHT planning phase 2.
- Social-posts live row (Phase 3 job-for-later).
- Stable logos/trainer photos (Phase 2 media).
- MC authoring for missing highlights.
- Prod/v cutover, migrations on Evolution-3.0, DNS — founder-gated.

## Compliance notes
- Terminology: `upfront` not one_time; Tokinvest references purged; owner/lessor = Evolution Stables.
- No commercial fiction: race summary computed from real data only.

## Founder decisions at Gate 1 (defaults chosen, override freely)
- D1 Ratio: LEFT 2fr (66.7%) / RIGHT 1fr (33.3%) — true thirds per your mental model. Alternative: prod 1.6fr/1fr (61.5/38.5).
- D2 Pedigree guest-gating: adopt prod blur ("Register/Investor to view"). Alternative: fully public.
- D3 Video defaults: muted+loop+pause-off-slide (browser rules force mute). Alternative: no loop.