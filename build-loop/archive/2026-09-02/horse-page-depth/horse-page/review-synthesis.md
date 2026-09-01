# Stage 2 — Plan Review Synthesis (kimi-k2.7-code plan audit + orchestrator reconciliation)

**Audit: kimi-k2.7-code plan audit, 2026-08-30, verdict WARN (passes with fixes).**
Raw verdict: `kimi-plan-verdict.md` · Brief: `kimi-plan-brief.md`.

## Findings → resolutions (all applied to plan.md + plan-graph.json before execution)

| # | Finding (severity) | Resolution |
|---|---|---|
| 1 | CRITICAL: chunk map contradiction — rail stuffed into chunk-1, gate mislabeled chunk-9 | FIXED: rail shell (sticky container + status chip only) in chunk-1; full status-driven rail = new `chunk-9-rail`; gate = `chunk-10-gate` |
| 2 | HIGH: unverified data assumptions | VERIFIED NOW by orchestrator: `getCampaignBySlug` exists (horses-data.ts:243); status enum verified via DB (listed/fully_subscribed/coming_soon/completed); PDS/SA URL columns in seed SQL (pds/sa URLs per horse); video: `trackworkVideo` only with overrides — no videos today, deck handles absence (in chunk-3 DOD) |
| 3 | HIGH: missing types/schema chunk | FIXED: new `chunk-5b-types` — db_models InventoryHorse gains `race_log` jsonb + optional 4-gen pedigree fields (nullable, runtime fallbacks); runs after chunk-5-data |
| 4 | MEDIUM: redirect deletes old page → violates CUT=hide | FIXED: redirect via `next.config.ts` redirects array (config-level, pre-routing); `/horses/[slug]/page.tsx` stays on disk untouched — hidden, not deleted. Founder exception not needed |
| 5 | MEDIUM: curl walk = gate theater | FIXED: chunk-10 walk = curl smoke + CDP browser checklist (sticky rail, video 1s delay, lightbox, tab switch, guest blur, ratio) + psql data assertions; curl demoted to smoke |
| 6 | MEDIUM: SEO/metadata gap | FIXED: chunk-1 DOD now includes generateMetadata + not-found handling + sitemap repoint |
| 7 | LOW: pattern-only reuse edges (LogoCarousel, CtaLeadModal) | ACCEPTED: media-deck is a new component *modeled on* those patterns — edges relabelled inspiration, APIs spiked inside chunk-3 |
| 8 | LOW: grid path unverified | ALREADY VERIFIED by orchestrator pre-audit (file read earlier: components/marketplace-listing-grid.tsx, href={`/horses/${card.slug}`}); no change |

## Gate-1 approval record
APPROVED: 2026-08-30 — founder pre-authorized execution contingent on plan audit pass ("just run the plan past kimi-code-audit, if passes make a start"). WARN = pass-with-fixes; fixes above applied. Execution begins at chunk-1 + chunk-5/5b wave.

APPROVED: 2026-08-30 (conditional-on-audit, audit returned WARN with fixes applied)