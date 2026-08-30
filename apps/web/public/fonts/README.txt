Drop the licensed Benedict webfont here as: Benedict.woff2

Source: commercial typeface (Seniors Studio) — purchase/license it, then export
a woff2 (latin subset, weight 400) and name it exactly `Benedict.woff2`.
The @font-face in src/app/benedict.css picks it up automatically (font-display:
swap) and the story heading renders in Benedict instead of the Georgia fallback.
