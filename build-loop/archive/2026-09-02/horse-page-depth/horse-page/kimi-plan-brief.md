# PLAN AUDIT — Horse page LEFT/RIGHT build (pre-execution)

You are the chief auditor (kimi-k2.7-code). This is a PLAN audit: does this
plan hold up as a spec before a single line of code is written? You have
TWO inputs, quoted in full below:
1. build-loop/horse-page/plan.md (prose plan)
2. build-loop/horse-page/plan-graph.json (structured nodes/edges/chunks)

Context you may rely on (verified claims from the planning session):
- Founder-locked model doc: LEFT = 2/3 scrolling horse info; RIGHT = 1/3 sticky
  investment rail (status-driven). L1/L2/L3 content chain from MC jsonb.
- evo_02 = Next.js 15 + Turborepo + pnpm; gate = `just check` (lint/typecheck/test).
- Prod reference site exists with the exact layout being ported.

## Audit the plan for:
P1. Wrong/missing assumptions about the codebase (file paths, exports, data fields).
P2. Chunk dependency correctness — can each chunk leave the repo green? Any
    circular or missing dependencies in the edges?
P3. Verification steps that would NOT actually verify (gate theater).
P4. Scope gaps that will force a re-plan mid-build (missing migration steps,
    missing type updates after new jsonb fields, route/sitemap implications).
P5. Anything in the plan that CONTRADICTS the founder-locked model
    (LEFT/RIGHT, L1/L2/L3, CUT=hide rule, status-driven rail).
P6. Realistic risk ranking: which chunk is most likely to blow up, and what
    would you pre-empt now?

## Output format (strict)
# Verdict: PASS | WARN | FAIL
## Findings (numbered, severity, chunk-ref)
## Edge check (dependencies confirmed/doubted, with reasons)
## Pre-empt list (max 5, concrete)
Keep it tight. This is a gate, not an essay.

===== PLAN.MD =====
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
===== PLAN-GRAPH.JSON =====
{
  "plan": "horse-page",
  "based_on": "build-loop/page-model-notes.md (founder-locked model)",
  "output_format": {
    "kind": "files + local-supabase seed update + gates",
    "verification": "route 200s on /marketplace/[slug] via curl; just check 10/10; tab parity vs prod screenshots in page-model-notes.md"
  },
  "nodes": [
    {
      "id": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "type": "file",
      "description": "New horse page: LEFT/RIGHT grid, sticky RIGHT shell, story, tabs mount"
    },
    {
      "id": "file:apps/web/src/app/horses/[slug]/page.tsx",
      "type": "file",
      "description": "Becomes redirect to /marketplace/[slug]"
    },
    {
      "id": "file:apps/web/src/components/marketplace-listing-grid.tsx",
      "type": "file",
      "description": "Card links repoint /horses/ -> /marketplace/"
    },
    {
      "id": "file:apps/web/src/components/horse/media-deck.tsx",
      "type": "file",
      "description": "Cover + arrows + spec strip + thumb carousel + video slide + lightbox"
    },
    {
      "id": "file:apps/web/src/components/horse/story-block.tsx",
      "type": "file",
      "description": "THE STORY eyebrow + status chip + Meet X aka Y + paragraphs"
    },
    {
      "id": "file:apps/web/src/components/horse/tabs.tsx",
      "type": "file",
      "description": "Tab shell: overview | pedigree | trainer | race record | documents"
    },
    {
      "id": "file:apps/web/src/components/horse/overview-tab.tsx",
      "type": "file",
      "description": "L3: highlights + racing outlook"
    },
    {
      "id": "file:apps/web/src/components/horse/pedigree-tab.tsx",
      "type": "file",
      "description": "Matrix sub-tabs + linebreeding + 4-gen tree + footer strip"
    },
    {
      "id": "file:apps/web/src/components/horse/race-tab.tsx",
      "type": "file",
      "description": "Computed summary + status-aware empty copy + two external links"
    },
    {
      "id": "file:apps/web/src/components/horse/trainer-tab.tsx",
      "type": "file",
      "description": "Bio + website/socials icon row (footer icon set)"
    },
    {
      "id": "file:apps/web/src/components/horse/documents-tab.tsx",
      "type": "file",
      "description": "PDS/SA cards + guest gating overlay"
    },
    {
      "id": "file:apps/web/src/components/horse/right-rail.tsx",
      "type": "file",
      "description": "Sticky status-driven rail: listed CTA / fully-subscribed state"
    },
    {
      "id": "sql:seed-pedigree-4gen",
      "type": "sql",
      "description": "Local supabase: merge pedigrees.json 4-gen into inventory.pedigree_data"
    },
    {
      "id": "sql:seed-race-log",
      "type": "sql",
      "description": "Local supabase: new race_log jsonb field + first-gear/prudentia data"
    },
    {
      "id": "cmd:just-check",
      "type": "gate",
      "description": "just check 10/10 green"
    },
    {
      "id": "cmd:walk",
      "type": "gate",
      "description": "curl 200 on /marketplace + /marketplace/tml-x-yearn + /marketplace/nellie + redirect works"
    },
    {
      "id": "audit:kimi",
      "type": "audit",
      "description": "Stage 5 kimi-code-audit on full diff"
    },
    {
      "id": "file:apps/web/src/lib/horses-data.ts",
      "type": "file-existing",
      "description": "Existing data layer (getAllCampaigns/getCampaignMedia/formatHorseDisplayName)"
    },
    {
      "id": "file:apps/web/src/components/ui/LogoCarousel.tsx",
      "type": "file-existing",
      "description": "Existing carousel primitive (AS FEATURED IN)"
    },
    {
      "id": "file:apps/web/src/components/CtaLeadModal.tsx",
      "type": "file-existing",
      "description": "Existing overlay pattern (lightbox reference)"
    }
  ],
  "edges": [
    {
      "from": "file:apps/web/src/lib/horses-data.ts",
      "to": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "reason": "page consumes getAllCampaigns/getCampaignMedia/formatHorseDisplayName",
      "source": "existing imports in marketplace/page.tsx"
    },
    {
      "from": "file:apps/web/src/components/ui/LogoCarousel.tsx",
      "to": "file:apps/web/src/components/horse/media-deck.tsx",
      "reason": "thumb carousel reuses carousel mechanics",
      "source": "founder note L4"
    },
    {
      "from": "file:apps/web/src/components/CtaLeadModal.tsx",
      "to": "file:apps/web/src/components/horse/media-deck.tsx",
      "reason": "lightbox follows CtaLeadModal overlay pattern",
      "source": "founder note L5"
    },
    {
      "from": "sql:seed-pedigree-4gen",
      "to": "file:apps/web/src/components/horse/pedigree-tab.tsx",
      "reason": "4-gen tree renders from inventory.pedigree_data \u2014 data must land first",
      "source": "plan dependency"
    },
    {
      "from": "sql:seed-race-log",
      "to": "file:apps/web/src/components/horse/race-tab.tsx",
      "reason": "computed summary + timeline render from race_log",
      "source": "plan dependency"
    },
    {
      "from": "file:apps/web/src/components/horse/tabs.tsx",
      "to": "file:apps/web/src/components/horse/overview-tab.tsx",
      "reason": "tab shell mounts panels",
      "source": "component design"
    },
    {
      "from": "file:apps/web/src/components/horse/tabs.tsx",
      "to": "file:apps/web/src/components/horse/pedigree-tab.tsx",
      "reason": "tab shell mounts panels",
      "source": "component design"
    },
    {
      "from": "file:apps/web/src/components/horse/tabs.tsx",
      "to": "file:apps/web/src/components/horse/race-tab.tsx",
      "reason": "tab shell mounts panels",
      "source": "component design"
    },
    {
      "from": "file:apps/web/src/components/horse/tabs.tsx",
      "to": "file:apps/web/src/components/horse/trainer-tab.tsx",
      "reason": "tab shell mounts panels",
      "source": "component design"
    },
    {
      "from": "file:apps/web/src/components/horse/tabs.tsx",
      "to": "file:apps/web/src/components/horse/documents-tab.tsx",
      "reason": "tab shell mounts panels",
      "source": "component design"
    },
    {
      "from": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "to": "file:apps/web/src/components/horse/media-deck.tsx",
      "reason": "page mounts deck in LEFT",
      "source": "page design"
    },
    {
      "from": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "to": "file:apps/web/src/components/horse/story-block.tsx",
      "reason": "page mounts story in LEFT",
      "source": "page design"
    },
    {
      "from": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "to": "file:apps/web/src/components/horse/right-rail.tsx",
      "reason": "page mounts rail in RIGHT (sticky)",
      "source": "page design"
    },
    {
      "from": "file:apps/web/src/app/horses/[slug]/page.tsx",
      "to": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "reason": "redirect target must exist first",
      "source": "plan dependency"
    },
    {
      "from": "file:apps/web/src/components/marketplace-listing-grid.tsx",
      "to": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "reason": "card links repoint to new route",
      "source": "plan dependency"
    },
    {
      "from": "file:apps/web/src/app/marketplace/[slug]/page.tsx",
      "to": "cmd:just-check",
      "reason": "gate validates all new code",
      "source": "gate definition"
    },
    {
      "from": "cmd:just-check",
      "to": "cmd:walk",
      "reason": "walk after gates green",
      "source": "done-means-walked"
    },
    {
      "from": "cmd:walk",
      "to": "audit:kimi",
      "reason": "audit after walk proves behavior",
      "source": "build-loop stage 5"
    }
  ],
  "chunks": {
    "chunk-1-skeleton": {
      "nodes": [
        "file:apps/web/src/app/marketplace/[slug]/page.tsx",
        "file:apps/web/src/app/horses/[slug]/page.tsx",
        "file:apps/web/src/components/marketplace-listing-grid.tsx",
        "file:apps/web/src/components/horse/right-rail.tsx"
      ],
      "depends_on": [],
      "state": "pending",
      "dod": "LEFT/RIGHT grid renders, RIGHT sticky shell with status-driven placeholder, redirect + card links live, just check green"
    },
    "chunk-2-story": {
      "nodes": [
        "file:apps/web/src/components/horse/story-block.tsx"
      ],
      "depends_on": [
        "chunk-1-skeleton"
      ],
      "state": "pending",
      "dod": "Story block renders with status chip + Meet X aka Y + woven paragraphs from aboutHorse/trainerBio"
    },
    "chunk-3-media": {
      "nodes": [
        "file:apps/web/src/components/horse/media-deck.tsx"
      ],
      "depends_on": [
        "chunk-1-skeleton"
      ],
      "state": "pending",
      "dod": "Cover arrows page deck; contain discipline; spec strip; thumb carousel; video slide muted-autoplays after 1s + pauses off-slide; lightbox opens/closes"
    },
    "chunk-4-tabs-shell-overview-docs": {
      "nodes": [
        "file:apps/web/src/components/horse/tabs.tsx",
        "file:apps/web/src/components/horse/overview-tab.tsx",
        "file:apps/web/src/components/horse/documents-tab.tsx"
      ],
      "depends_on": [
        "chunk-2-story"
      ],
      "state": "pending",
      "dod": "Tab nav sticky within LEFT; overview renders highlights+outlook (graceful empty); documents renders PDS/SA with guest gating"
    },
    "chunk-5-data": {
      "nodes": [
        "sql:seed-pedigree-4gen",
        "sql:seed-race-log"
      ],
      "depends_on": [],
      "state": "pending",
      "dod": "Local supabase rows updated: 4-gen pedigree merged; race_log field added with real first-gear/prudentia logs; SELECTable via psql"
    },
    "chunk-6-tab-pedigree": {
      "nodes": [
        "file:apps/web/src/components/horse/pedigree-tab.tsx"
      ],
      "depends_on": [
        "chunk-4-tabs-shell-overview-docs",
        "chunk-5-data"
      ],
      "state": "pending",
      "dod": "Matrix/DAM/SIRE sub-tabs, linebreeding banner from real data, 4-gen tree, footer strip + external link"
    },
    "chunk-7-tab-race": {
      "nodes": [
        "file:apps/web/src/components/horse/race-tab.tsx"
      ],
      "depends_on": [
        "chunk-4-tabs-shell-overview-docs",
        "chunk-5-data"
      ],
      "state": "pending",
      "dod": "Summary computed from race_log (TML: None Wins \u00b7 None Places; First Gear: real counts); status-aware copy; two external links from loveracing ids"
    },
    "chunk-8-tab-trainer": {
      "nodes": [
        "file:apps/web/src/components/horse/trainer-tab.tsx"
      ],
      "depends_on": [
        "chunk-4-tabs-shell-overview-docs"
      ],
      "state": "pending",
      "dod": "Bio block + website/socials icon row rendering only existing links (footer icon set)"
    },
    "chunk-9-gate-audit": {
      "nodes": [
        "cmd:just-check",
        "cmd:walk",
        "audit:kimi"
      ],
      "depends_on": [
        "chunk-6-tab-pedigree",
        "chunk-7-tab-race",
        "chunk-8-tab-trainer",
        "chunk-3-media"
      ],
      "state": "pending",
      "dod": "just check 10/10, curl walk 200s + redirect, kimi audit verdict PASS/WARN-accepted"
    }
  },
  "founder_decisions_open": {
    "D1_ratio": "default LEFT 2fr/RIGHT 1fr (true thirds); alt prod 1.6fr/1fr",
    "D2_pedigree_gating": "default: prod blur-for-guests; alt: public",
    "D3_video": "default: muted+loop+pause-off-slide; alt: no loop"
  }
}