# build-loop — cycle archive & index

Build loop artifacts, one directory per cycle. Closed cycles auto-archive on the
open of the next one (build-loop skill Rule 12). Canonical names (`plan.md`,
`plan-graph.json`, `chunks.md`, `review-synthesis.md`, `audit-report.md`,
`audit-graph.json`) live ONLY inside cycle dirs — never bare at this root.

## Active

| Cycle | Dir | State |
|---|---|---|
| E3 purchase flow (rung 4) | `e3-rung4/` | Content spec locked + 4/4 chunks done · **Next: Stitch wireframes from `../purchase-content-spec.md` THE AGREED FLOW, then build (stepper rework, KYC port, E4)** |

## Archive

| Cycle | Moved | Home |
|---|---|---|
| Sprint 1 — intake pipeline | Aug 2026 (pre-convention) | `archive-sprint1-intake-pipeline/` |
| UI sprint + Tracks A/B | 2026-09-02 | `archive/2026-09-02/ui-sprint-tracks-a-b/` |
| Horse page depth (E1/E2) | 2026-09-02 | `archive/2026-09-02/horse-page-depth/` |
| 3-layer story grid | 2026-09-02 | `archive/2026-09-02/3layer/` |
| Founder pass 3 | 2026-09-02 | `archive/2026-09-02/founder-pass-3/` |

## Root files (cited shared refs — do not move without updating CONTINUE.md/AGENTS.md)

- `e3-right-rail-deepdive.md` — E3 locked decisions (cited by AGENTS.md)
- `purchase-content-spec.md` — THE AGREED FLOW (signed off 2026-09-01; wireframe source)
- `go-live-dod.md` — go-live definition of done
- `investor-flows-report.md` · `service-blueprint.md` · `e3-content-tree.md` — flow scoping SSOTs
- `today.md` — working day-log
- `trainer-location-lock.md` — canonical trainer facts
- `stitch-screenshots/` — live wireframe-phase screenshots
