# E3 Purchase Flow — Swimlane Map (all flows & outcomes)

**Status:** flow reference (2026-09-01). Content per node: `build-loop/e3-content-tree.md`.
**Lanes:** Investor · Website (evo_02) · Stripe · Evolution Stables (backend)
**Node types:** ⬭ start/end · ▭ action · ◇ decision · ⚠ error/outcome

```mermaid
flowchart TD
    subgraph INV["INVESTOR"]
        A([Land on horse page]) --> B[Select stake via stepper+input<br/>opens at min · step 0.5% · max = available %]
        B --> C[Read pillars<br/>The Deal / Included / What If / Return / Exit]
        C --> D[Click Become an Owner / Acquire Units]
        D --> E[Scroll PDS → tick box 1]
        E --> F[Scroll SA → tick box 2]
        F --> G[Click Proceed to Secure Checkout]
        G --> H[Pay on Stripe hosted page]
        H --> I{Payment outcome?}
        I -->|Success| J[Land on MyStable<br/>success state]
        I -->|Cancel| K[Back to horse page<br/>stake pre-filled via ?units=]
    end

    subgraph WEB["WEBSITE (evo_02)"]
        A1{Campaign status?}
        A --> A1
        A1 -->|Open| B
        A1 -->|Fully Subscribed / Completed| L[Amber pill · NO rail CTA] --> Z([END])
        A1 -->|Coming Soon| M[Green pill · NO rail CTA] --> Z
        B --> N{Authenticated?}
        N -->|No| O[Google OAuth login] --> B
        N -->|Yes| P{KYC verified?}
        P -->|No| Q[KYC prompt in gate modal<br/>read-then-verify — docs readable,<br/>checkout blocked until verified]
        P -->|Yes| R[Open gate modal<br/>Regulatory Acknowledgment]
        R --> E
        G --> S{Reservation OK?<br/>15-min TTL}
        S -->|No — insufficient shares| T[Error → back to rail] --> Z
        S -->|Yes| U[Create Stripe session<br/>metadata: slug, units, hashes, reservation]
        U --> H
        J --> V[MyStable dashboard<br/>holding visible]
    end

    subgraph STRIPE["STRIPE"]
        U --> W[Hosted checkout]
        W --> H
        H --> X[Webhook: checkout.session.completed]
    end

    subgraph EVO["EVOLUTION STABLES (backend)"]
        X --> Y{Valid?}
        Y -->|Bad signature / dup event| Z
        Y -->|OK| AA[Verify pds_hash + sa_hash]
        AA --> AB[Insert holding row]
        AB --> AC[Consume reservation]
        AC --> AD[Upload PDS + SA to vault (R2)]
        AD --> AE[E4: welcome email + bcc list]
        AE --> V
    end

    style A fill:#0a0a0a,stroke:#d4a964,color:#f8fafc
    style Z fill:#0a0a0a,stroke:#737373,color:#737373
```

## Outcomes (all terminal states)

| # | Outcome | Where | Next |
|---|---|---|---|
| 1 | **Purchase complete** — holding + vault docs + email | MyStable | E4 success state |
| 2 | **Payment cancelled** — stake pre-filled via `?units=` (Option A, RESOLVED) | horse page | retry anytime |
| 3 | **Campaign closed** (Subscribed/Completed/Coming Soon) | horse page | no CTA, amber/green pill |
| 4 | **Not authenticated** — login redirect, stake NOT preserved (`next` = pathname only, `right-rail.tsx:271-272`) — fix queued with Option A | Google OAuth | back to rail |
| 5 | **KYC not verified** — read-then-verify: docs readable, checkout blocked | gate modal | KYC prompt in-modal → Stripe Identity (port from prod) |
| 6 | **Reservation failed** — insufficient shares | rail | error, no charge |
| 7 | **Reservation expired** (15 min) | checkout | re-reserve, retry |
| 8 | **Webhook rejected** — bad signature / dup | backend | logged, no holding |

## Content mapping

- **Screen 1 (rail) + Screen 2 (gate modal):** `build-loop/e3-content-tree.md` — locked copy
- **PDS/SA bodies:** compiled legal pack per horse (hashes in modal)
- **Emails (E4):** welcome email — not this sprint
- **MyStable success state (E4):** not this sprint

## Open items (founder)

1. KYC-not-verified UX: **RESOLVED 2026-09-01 — read-then-verify** (investor-flows-report §4): gate modal opens pre-KYC, checkout blocked until verified. KYC = PORT from production (Firebase → Supabase), UX already designed + walked.
2. Reservation-expired UX: auto-re-reserve or manual retry? (currently manual)
3. Cancel → stake preserved: **RESOLVED 2026-09-01 — Option A** (carry units in `cancel_url`; `create-session/route.ts:106` appends `?units=`, horse page pre-fills). Fix queued.
