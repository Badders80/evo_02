#!/usr/bin/env python3
"""Edge-white scanner for the @evo/storage edge-white gate.

Walks apps/web/public, samples 8 edge pixels per image, and prints a JSON
report: {"scanned": N, "failures": [{path, whiteEdges}], "exempt": [...]}.

A sample "hits" when it is opaque (alpha >= 250, or no alpha channel) and
near-white (min(R,G,B) >= 250). An image fails when >= 6/8 samples hit.
Paths in the report are public-root-relative (e.g. /horses/nellie/01.png).
"""
import json
import sys
from pathlib import Path

from PIL import Image

PUBLIC_DIR = Path(__file__).resolve().parents[3] / "apps" / "web" / "public"
IMAGE_EXT = {".png", ".webp", ".jpg", ".jpeg"}

# Deliberate white-art-on-white compositions. One public path per entry.
EXEMPT: set[str] = set()

EDGE_POINTS = [(0.5, 0.0), (0.5, 1.0), (0.0, 0.5), (1.0, 0.5),
               (0.001, 0.001), (0.999, 0.001), (0.001, 0.999), (0.999, 0.999)]


def white_edge_samples(path: Path) -> int:
    im = Image.open(path)
    im.load()
    if im.mode != "RGBA":
        # P may carry transparency in its palette; flatten assumes worst case
        # (no alpha) which is exactly the RGB-flatten trap we want to catch.
        im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    hits = 0
    for fx, fy in EDGE_POINTS:
        x = min(w - 1, max(0, round(fx * (w - 1))))
        y = min(h - 1, max(0, round(fy * (h - 1))))
        r, g, b, a = px[x, y][:4]
        if a >= 250 and min(r, g, b) >= 250:
            hits += 1
    return hits


def main() -> int:
    files = sorted(p for p in PUBLIC_DIR.rglob("*")
                   if p.is_file() and p.suffix.lower() in IMAGE_EXT)
    failures = []
    for p in files:
        rel = "/" + p.relative_to(PUBLIC_DIR).as_posix()
        if rel in EXEMPT:
            continue
        try:
            hits = white_edge_samples(p)
        except Exception as exc:  # corrupt/undecodable image = failure, not skip
            failures.append({"path": rel, "whiteEdges": 99, "error": str(exc)})
            continue
        if hits >= 6:
            failures.append({"path": rel, "whiteEdges": hits})
    print(json.dumps({
        "scanned": len(files),
        "failures": failures,
        "exempt": sorted(EXEMPT),
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
