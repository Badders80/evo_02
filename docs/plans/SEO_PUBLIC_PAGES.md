# Public SEO (marketing / legal / horse story)

Landed on `sprint-1-nellie-loop`: crawlable sitemap (`/`, `/faq`, `/privacy`, `/terms`, `/learn/returns`, each `/horses/{slug}` + `/about`); robots allow `/` and disallow `/api/`, `/login`, `/mystable`, `/auth/`; login + mystable `noindex,nofollow` layouts.
Root metadata: `twitter.card=summary_large_image` (no site/creator), `openGraph.images` 1200×630 via `metadataBase` https://evolutionstables.nz.
OG asset: `apps/web/public/og/default.png` — raster of `public/brand/logos/wordmark/wordmark-gold.svg` on dark luxury canvas (no horses, no Te Akau/Marsh).
Horse PDP + about `generateMetadata`: hero still `01`, twitter card, canonical URL. PDP JSON-LD is WebPage + Organization (not Product/security).
Root JSON-LD: Organization + WebSite (name Evolution Stables, NZ). FAQ JSON-LD is the same 5 Q&As; DSL lot line fixed (Nellie 0.5%; Prudentia/Hotta 0.25%; not all 1%).
Did not restyle homepage, checkout, webhook, mystable UI, login UI, KYC, reserve RPC, or Mission Control.
Blocked: none for this slice. Sitemap does not include `/login`, `/mystable`, `/api`.
Verify: `pnpm --filter @evo/web typecheck`.
