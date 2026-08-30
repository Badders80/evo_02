# Pass-3 Audit Report — founder edits (hero, pedigree, story heading, /auth/login)

**Commit:** `6729833` (amended; supersedes `b94f908`, includes parallel-session `88a8f9a` trainer-copy purge)
**Branch:** `design-alignment` (LOCAL-ONLY — not pushed)
**Gate:** `just check` 10/10 PASS · `pnpm build` all routes (`/auth/login` 3.86 kB, `/login` 159 B redirect) · live curls 200/307 · CDP browser walk all elements verified · screenshots: `/tmp/pass3-login-final4.png`, `/tmp/pass3-pedigree-walk.png`
**Kimi review:** kimi-k2.7-code via ollama-cloud, diff-scoped · 0 CRITICAL · 4 WARN (1 real, 3 false-positives — see below)

## Per-task results

| # | Task | Result | Evidence |
|---|------|--------|----------|
| 1 | Hero → old prod style | PASS | media-deck.tsx:112-180 — dot-grid full-bleed (-mx/-mt), breadcrumb `MARKETPLACE / <NAME>` (L138-144), 62vh centered cutout (L147), single rounded-3xl 4-col strip, label-above-value (L166-171). CDP: breadcrumb + strip values render on /marketplace/hottathanafantasy |
| 2 | Pedigree → prod style, left ⅔ + modal | PASS | pedigree-tab.tsx — BROODMARE SIRE chip (headerRow), pill sub-tabs, horizontal cascade (SUBJECT→PARENTS→GRANDPARENTS→GREAT-GRANDPARENTS, NodeWithStub connectors), panel rendered inside page's `lg:grid-cols-[2fr_1fr]` left column; EXPAND → fullscreen modal (role=dialog, Esc listener L~377, overlay click, CLOSE button). CDP walk: all 7 element checks true, modal open/close verified. buildPedigreeTree semantics unchanged (ported verbatim, locked by tests) |
| 3 | Story heading — Benedict + aka | PASS (fallback-only) | story-block.tsx:69-70 — `.font-benedict` + `text-accent` (#d4a964); `(aka X)` span at `text-[0.7em]` = 30% smaller; shouldShowAka() derives from data (Manolo suppressed at horses-data.ts rowToCampaign → name only; CDP-verified both). **BENEDICT FONT STATUS: FALLBACK-ONLY** — Benedict is a commercial typeface (Seniors Studio), not on Google Fonts/Fontsource (404s verified). @font-face in apps/web/src/app/benedict.css + Georgia/'Times New Roman' serif stack, font-display: swap; activates automatically when licensed `Benedict.woff2` is dropped in apps/web/public/fonts/ (instructions in public/fonts/README.txt) |
| 4 | /auth/login prod parity + repoint | PASS | auth/login/page.tsx — near-black dot-grid canvas, centered rounded-3xl card, gold lockup logo (prod-verified render), SIGN IN letterspaced, Google pill (existing /api/auth/google app-mediated OAuth), or-divider, Email/Password via existing supabase.auth.signInWithPassword, Forgot password?, Need an account? Sign up (exact prod casing extracted from prod's JS chunk 0~918s0fsob8q.js). Repointed: NavBar.tsx ×2, header.tsx, mystable-dashboard.tsx sign-out, middleware.ts /mystable guard. /login → 307 /auth/login (redirect() in login/page.tsx; curl-verified). BONUS: repaired invalid XML in lockup-horizontal-gold/white.svg (premature </g> at 2 letter lines caused black ghost wordmark; validated, browser-verified clean) |

## Kimi findings adjudication

| Finding | Verdict |
|---|---|
| WARN forgot-password is placeholder (preventDefault) | **REAL WARN — intentional**: money is closed, no reset flow exists; tooltip explains. Founder to decide when to wire reset |
| WARN sign-up → /marketplace "odd" | Accepted design: no registration flow; investors onboard via marketplace lead capture (matches old login's Explore Available Horses) |
| WARN /login redirect "not in diff" | **FALSE-POSITIVE**: redirect() IS in login/page.tsx (verified in file + live 307); kimi's diff scope excluded that file |
| WARN font-benedict stack "not shown in diff" | **FALSE-POSITIVE**: full fallback stack IS defined in benedict.css (verified) and imported in globals.css |

## Constraints honoured
Local-only (no push) · pricing untouched · owner name 'Evolution Stables' · real pedigree_data only · canonical trainer canon extended by parallel session with guard test (registry.test.ts fails if street address re-enters).

## Open items for founder
1. Drop licensed `Benedict.woff2` into `apps/web/public/fonts/` (heading upgrades automatically).
2. Decide on forgot-password flow (currently deliberate placeholder).
3. Founder click-through: /auth/login, /marketplace/hottathanafantasy (hero + pedigree + EXPAND), /marketplace/i-stole-a-manolo (heading, no aka).
