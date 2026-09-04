# DS101 — Digital-Syndication 101 drawer (architecture + content spec)

**Date:** 2026-09-02
**Branch:** `design-alignment` (LOCAL-ONLY — never push, never merge)
**Cycle type:** BA/content deliverable phase — NOT build, NOT wireframes, NOT copy-lock yet
**Inputs (verified paths):** `build-loop/purchase-content-spec.md` (THE AGREED FLOW + BACKLOG NOTE, cross-links here) · `evo_01/02_website/src/app/learn/returns/page.tsx` (the "Your Return" content, pre-restructure; becomes redirect once drawer lives) · `evo_01/01_evolution/mission-control/admin/generators/pack_lib.py` (DSL → PDS/SA template) · `evo_01/02_website/src/data/hlts.json` (campaign data) · `evo_00/` VOICE_AND_TONE_MANUAL.md (voice) · `evo_02/apps/web/src/lib/nellie-loop.ts` + `apps/web/src/app/marketplace/[slug]/page.tsx` (getCompiledLegalPackForCampaign — the chat grounding source)

## 1. Goal (one sentence)

Produce the BA architecture spec for the Digital-Syndication 101 left-sidebar drawer — the coverage map of key PDS/SA/Rules-of-Racing/COP concepts each in heading/statement/question form, organised as question-chains (not a document map), §-pointed to sources, with the leg-out fixture and the chat-window grounding note — so content drafting and later wireframe/build have a locked contract.

## 2. Already locked (from CONTINUE.md 2026-09-01 — do not re-derive)

- **Form:** LEFT-sidebar drawer · titled groups with drop-downs (accordion — homepage-FAQ pattern) · 2 levels max (group → entry) · never a man page, never deep nesting
- **Design principle:** question-chain, not document-map — each answer plants the seed of the next question; **"Horse Comes First" is the spine** (every uncomfortable money question resolves to it)
- **Format free:** headings/statements/questions mixed; entry count = whatever explains the key PDS/SA material, no more. **Acceptance test:** investor reads it in ~10 min and understands what they're buying, how money flows, what happens on injury
- **Compliance:** light § source refs (PDS §4, SA §13, COP 18.4) — never a citation library · **NEVER invent claims — only reframe** · no source-backed answer = "ask us" → manual-assistance · chain links must not fabricate causality (READING TASK before writing links) · **LEG-OUT FIXTURE verbatim:** "This overview is a general guide. Each stake is governed by the PDS and Syndicate Agreement issued for that horse — please read them before investing."
- **Chat window (later phase, same project):** grounded in drawer content + compiled legal pack (`getCompiledLegalPackForCampaign`), per-horse scope, §-pointed, never improvises, declares itself ("I summarise the documents; the documents govern"). Build order: drawer first, chat rides the same layer (corpus work zero-waste)
- **/learn/returns slots in** — it IS the "Your Return" content pre-restructured; becomes a redirect once the drawer lives

## 3. Deliverable (this cycle)

`build-loop/ds101/spec.md` — the architecture spec:
- Coverage map: every key concept from PDS/SA/COP material that matters to an investor, each given a group slot
- Groups + question-chains (order the investor's mind demands), each chain link with its source §
- Trigger point recommendation (candidate: term-sheet "learn more" — lands with wireframing phase of the main flow)
- Format decisions per entry (heading | statement | question)
- Leg-out placement + chat-window grounding note

## 4. Exact files

- Create: `build-loop/ds101/plan.md` · `plan-graph.json` · `chunks.md` (this cycle)
- Create: `build-loop/ds101/source-truth.md` — reading-task output: every claim the chains rest on, verified against actual doc text with § (chunk-1)
- Create: `build-loop/ds101/spec.md` — the architecture spec (chunk-2)
- Modify: `build-loop/README.md` — add ds101 as active cycle (NOT archiving e3-rung4 — flow-mock review is in progress; two active cycles is the exception the founder chose)
- No React, no wireframes, no chat infra, no /learn/returns redirect in this cycle

## 5. Chunks (each leaves the tree clean, each ends verified)

- **chunk-1 — source-truth.md (READING TASK):** read pack_lib.py template + hlts.json + /learn/returns content + e3 right-rail pillars; verify every intended chain claim (upfront float → spans final months; injury → keep stops/applies; 75% gross pro-rata; quarterly settlement; deposit/keep split; exit mechanics) with exact § references; flag any claim the docs do NOT support → "ask us" bucket. Gate: every chain link in the proposal has a § source or is flagged unsupported; no invented causality.
- **chunk-2 — spec.md (architecture spec):** coverage map + groups + chains + format + trigger recommendation + leg-out + chat note, per §2 locks. Gate: acceptance test stated; every § ref traceable to source-truth.md; voice whitelist checked (Stake not Units/Shares; no exclamation marks; British English); leg-out fixture verbatim.
- **chunk-3 — (GATE 1 + founder contour, between 2 and 4):** founder reviews spec; fluid until lock.
- **chunk-4 — (later, post-lock):** content draft — every drawer entry in full copy, §-pointed. NOT in this cycle's initial dispatch; starts only after founder locks spec.

## 6. Out of scope (rejects scope creep)

No React build · no Stitch wireframes (lands with main-flow wireframing phase) · no chat-window infra (rides drawer layer later) · no /learn/returns rewrite or redirect implementation · no new legal/commercial claims · no mission_control / migrations / prod surfaces (evo_02 branch laws unchanged) · no PURCHASES_ENABLED change.

## 7. Verification (per chunk)

- chunk-1: `grep` the § refs against actual source files (`pack_lib.py` / PDS text); every intended chain claim mapped PASS/UNSUPPORTED.
- chunk-2: spec.md cross-checked against CONTINUE.md locks list (§2 above) — no lock contradicted; leg-out fixture byte-exact.
- Overall: founder read test ~10 min (the acceptance test) before lock.

## 8. Relationship to the main flow

The drawer is NOT part of the 6-step purchase flow build; it is a linked but independent track (the founder's decision, 2026-09-02). `purchase-content-spec.md` BACKLOG NOTE stays the cross-reference; trigger point (term-sheet learn-more) lands with the main flow's wireframing phase. Build order: DS101 spec → lock → content → wireframe (with main flow) → build.
