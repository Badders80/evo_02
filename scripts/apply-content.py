#!/usr/bin/env python3
"""Apply founder-approved content drafts (knowledge repo) to inventory.soft_legal.

Reads 01_evolution/horses/{slug}/content-draft.md, parses the ## sections,
and merges into inventory.soft_legal jsonb (preserving trainerBio + any
existing keys). Founder folder-gate passed 2026-08-31.
"""

import json
import re
import sys

import psycopg2

DB_HOST = "localhost"
DB_PORT = 54322
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

KNOWLEDGE_ROOT = "/home/evo/new/evo_01/01_evolution/horses"

HORSES = ["prudentia", "hottathanafantasy", "first-gear"]

# Fields that map 1:1 from draft section name to soft_legal key.
SECTION_TO_KEY = {
    "campaignNarrative": "campaignNarrative",
    "trainerQuote": "trainerQuote",
    "nextUp": "nextUp",
    "latestUpdateUrl": "latestUpdateUrl",
    "updateCount": "updateCount",
    "aboutHorse": "aboutHorse",
    "racingOutlookAndPedigree": "racingOutlookAndPedigree",
}


def parse_draft(path: str) -> dict:
    """Parse '## section' markdown into {key: value}."""
    with open(path) as f:
        text = f.read()

    sections = re.split(r"^##\s+", text, flags=re.M)
    out = {}
    for sec in sections[1:]:
        # Section name is the first line; strip any parenthetical like "(L2 story)"
        name_line, _, body = sec.partition("\n")
        name = re.sub(r"\s*\(.*\)\s*$", "", name_line).strip()
        key = SECTION_TO_KEY.get(name)
        if key is None:
            print(f"  [skip] unknown section: {name_line!r}")
            continue
        value = body.strip()
        if key == "updateCount":
            try:
                out[key] = int(value)
            except ValueError:
                print(f"  [warn] updateCount not int: {value!r}")
                out[key] = None
        else:
            out[key] = value
    return out


def voice_check(draft: dict, slug: str) -> list:
    """Silent Gavel scan: banned words, exclamation marks, negation openers."""
    banned = [
        "payout", "roi", "yield", "dividend", "top-up", "token", "blockchain",
        "crypto", "web3", "nft", "rwa", "revolutionary", "game-changing",
        "democratis", "fractional coins", "pieces", "parts of",
    ]
    issues = []
    for key, value in draft.items():
        if not isinstance(value, str):
            continue
        low = value.lower()
        for word in banned:
            # Word-boundary match — substring would false-positive on e.g. "roi" inside "Proisir"
            if re.search(rf"\b{re.escape(word)}\b", low):
                issues.append(f"{slug}.{key}: banned word '{word}'")
        if "!" in value:
            issues.append(f"{slug}.{key}: exclamation mark")
        for opener in ["we are not", "we're not", "this is not", "it's not"]:
            if low.startswith(opener):
                issues.append(f"{slug}.{key}: negation opener '{opener}'")
    return issues


def main() -> int:
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD,
    )
    conn.autocommit = False
    cur = conn.cursor()

    all_issues = []
    for slug in HORSES:
        path = f"{KNOWLEDGE_ROOT}/{slug}/content-draft.md"
        draft = parse_draft(path)
        if not draft:
            print(f"✗ {slug}: no sections parsed — aborting")
            conn.rollback()
            return 1

        issues = voice_check(draft, slug)
        all_issues.extend(issues)

        # Merge into soft_legal, preserving existing keys (trainerBio etc.)
        payload = {k: v for k, v in draft.items() if v is not None}
        cur.execute(
            "UPDATE inventory SET soft_legal = soft_legal || %s::jsonb, updated_at = now() WHERE slug = %s",
            (json.dumps(payload), slug),
        )
        print(f"✓ {slug}: applied {len(payload)} fields ({', '.join(payload.keys())})")

    if all_issues:
        print("\n⚠ VOICE CHECK ISSUES (Silent Gavel):")
        for i in all_issues:
            print(f"  - {i}")
    else:
        print("\n✓ Voice check clean: no banned words, exclamation marks, or negation openers.")

    conn.commit()
    cur.close()
    conn.close()
    print("\n✅ Content apply complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
