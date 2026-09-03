# Format pass — sweep 1 (2026-09-04)

Pixel-vs-mock comparison: live build captures (`format-pass/live-*.png`) vs locked mockup (`flow-mock/*.png` + `index.html`).

## Fixed (committed `d51a32a`)

**CTA fills read disabled** — rail "Become an Owner", modal "Invest in {horse}", KYC "Verify Identity" all used `bg-foreground text-background`. `--color-foreground` in dark scope = `rgba(255,255,255,0.5)` → 50%-transparent white → looked gray/disabled. Locked mockup uses `bg-pure-white text-black`. Changed all 3 to `bg-pure-white text-black`. Computed style verified: `rgb(255,255,255)` bg, `rgb(0,0,0)` text. Visual re-capture confirms primary look.

## Checked, NOT issues (don't re-flag)

- **`{dsl: service_end_date}` token** in Lease-period sub-note — present in the LOCKED mockup itself (index.html:239, placeholder for the legal engine). Deliberate; resolves when DSL wiring lands. Do not "fix".
- **Step-2 fine print / CTA "clipped" at bottom** — modal is the locked 720px scrollable shell (`max-w-lg h-[720px]`, content scrolls); innerText proves all content present. Capture artifact of the viewport-crop, same as mockup popup2.png (which also crops the CTA).
- **`{lstPrize distribution type}` read** — misread of the "Learn more about how prize money is distributed" link in the screenshot; innerText confirms correct copy.
- **Step-3 backdrop bleed on left edge** — modal centered `max-w-lg` over horse page; the page visibly shows beside a fixed overlay at wider viewports. Mockup renders the modal on an empty artboard. Not drift from the locked pattern (dialog-over-page), no change.
- **Step-2 stat-card height mismatch** — "Your stake" card taller (2-line sub-note vs Price's 1). Same in the locked mockup markup (index.html:155-211). No change.
- **Rail caption row wraps on narrow clip** — 3-column fine-print row renders 1 line at real desktop rail width; wrap only at 336px-squeezed capture. Locked copy is on one line (right-rail.tsx:306-308). No change.

## Next sweep candidates (deferred, minor)

- Slider track thin/low-contrast at min value hugs left edge (medium, cosmetic; rail slider is pre-existing E3 surface, not this cycle's scope).
- Rail body line hardcodes "1.0%" / "0.5%" (`right-rail.tsx:279`) — DSL-driven min/step would be more honest (f3 wired min_stake_pct into the slider, the copy line lags). Flag for a content sweep, not the format pass.

## Evidence

- Live: `live-rail.png`, `live-rail-desktop.png`, `live-modal-step2.png`, `live-modal-step2-cta.png`, `live-modal-step2-error.png`, `live-modal-step3.png`, `live-modal-step3-desktop.png`, `live-modal-step3-kyc.png`, `live-mystable-success.png`
- Reference: `flow-mock/*.png` (popup2, popup3, step1, step4, rail, full)
