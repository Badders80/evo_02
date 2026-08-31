#!/usr/bin/env python3
"""
Script: sync-race-log.py

Reads knowledge-repo race records at /home/evo/new/evo_01/01_evolution/horses/{slug}/race-record.json
for specified slugs and upserts race_log JSONB into inventory.race_log in local Supabase.

Maps snake_case keys from knowledge repo to RaceLogEntry camelCase:
  race_name    -> race
  track_condition -> trackCondition
  prizemoney_nzd stays
  distance_m stays
  race_class stays
  starting_price stays
  jockey stays
  result stays
  margin stays
  date stays
  venue stays

Handles missing optional fields gracefully (skip undefined keys).

Usage:
    python3 sync-race-log.py [--slug SLUG] [--horses FILE]

Options:
    --slug SLUG           Process a single horse slug (repeatable)
    --horses FILE         Path to JSON file listing horse slugs to process
    --supabase-host HOST  Supabase host (default: localhost)
    --supabase-port PORT  Supabase port (default: 54322)
    --supabase-db DB      Database name (default: postgres)
    --supabase-user USER  User (default: postgres)
    --supabase-pass PASS  Password (default: postgres)
"""

import json
import os
import sys
import argparse
import psycopg2
from psycopg2 import sql


# --- Configuration ---
DEFAULT_SLUGS = ["prudentia", "first-gear", "hottathanafantasy"]
KNOWLEDGE_REPO_ROOT = "/home/evo/new/evo_01/01_evolution/horses"
DEFAULT_DB_HOST = "localhost"
DEFAULT_DB_PORT = 54322
DEFAULT_DB_NAME = "postgres"
DEFAULT_DB_USER = "postgres"
DEFAULT_DB_PASSWORD = "postgres"


SNAKE_TO_CAMEL_MAP = {
    "race_name": "race",
    "track_condition": "trackCondition",
    # The following keys stay as-is (already camelCase or don't need mapping):
    "prizemoney_nzd": "prizemoney_nzd",
    "distance_m": "distance_m",
    "race_class": "race_class",
    "starting_price": "starting_price",
    "jockey": "jockey",
    "result": "result",
    "margin": "margin",
    "date": "date",
    "venue": "venue",
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Sync knowledge-repo race records into inventory.race_log"
    )
    parser.add_argument(
        "--slug",
        action="append",
        default=[],
        help="Process a single horse slug (repeatable). Defaults to KNOWLEDGE_REPO slugs if not specified.",
    )
    parser.add_argument(
        "--horses",
        default=None,
        help="Path to JSON file listing horse slugs to process.",
    )
    parser.add_argument(
        "--supabase-host",
        default=DEFAULT_DB_HOST,
        help="Supabase host (default: localhost)",
    )
    parser.add_argument(
        "--supabase-port",
        type=int,
        default=DEFAULT_DB_PORT,
        help="Supabase port (default: 54322)",
    )
    parser.add_argument(
        "--supabase-db",
        default=DEFAULT_DB_NAME,
        help="Database name (default: postgres)",
    )
    parser.add_argument(
        "--supabase-user",
        default=DEFAULT_DB_USER,
        help="User (default: postgres)",
    )
    parser.add_argument(
        "--supabase-pass",
        default=DEFAULT_DB_PASSWORD,
        help="Password (default: postgres)",
    )
    return parser.parse_args()


def load_slugs(args):
    """Determine which horse slugs to process."""
    if args.slug:
        return args.slug
    if args.horses:
        with open(args.horses, "r") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and "slugs" in data:
                return data["slugs"]
    return DEFAULT_SLUGS


def map_race_entry(start_entry):
    """
    Map a snake_case start entry from the knowledge repo to camelCase RaceLogEntry.
    Handles missing optional fields gracefully.
    """
    mapped = {}
    for snake_key, camel_key in SNAKE_TO_CAMEL_MAP.items():
        if snake_key in start_entry:
            mapped[camel_key] = start_entry[snake_key]
    # Also include any keys that are not in the map but are known race log fields
    known_keys = {
        "race", "trackCondition", "prizemoney_nzd", "distance_m",
        "race_class", "starting_price", "jockey", "result", "margin", "date", "venue"
    }
    for key, value in start_entry.items():
        if key not in known_keys:
            # Unknown key - skip it (handle gracefully)
            continue
        # If not already mapped via the explicit map, use the key as-is
        if key in SNAKE_TO_CAMEL_MAP:
            # Already handled
            pass
        else:
            # Key is already camelCase or doesn't need mapping
            mapped[key] = value
    return mapped


def connect_db(host, port, dbname, user, password):
    """Connect to the Supabase-local Postgres database."""
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password,
    )
    conn.autocommit = False
    return conn


def get_race_record(slug):
    """Load the race-record.json for a given slug from the knowledge repo."""
    path = os.path.join(KNOWLEDGE_REPO_ROOT, slug, "race-record.json")
    if not os.path.exists(path):
        print(f"⚠️  Race record not found at {path}, skipping {slug}")
        return None
    with open(path, "r") as f:
        data = json.load(f)
    return data


def upsert_race_log(conn, slug, race_log_entry):
    """Upsert race_log into inventory for the given slug."""
    cur = conn.cursor()
    # Upsert: insert or update race_log for the slug
    update_sql = """\
        INSERT INTO public.inventory (slug, race_log)
        VALUES (%s, %s::jsonb)
        ON CONFLICT (slug) DO UPDATE
        SET race_log = %s::jsonb;
    """
    cur.execute(update_sql, (slug, json.dumps(race_log_entry), json.dumps(race_log_entry)))
    conn.commit()
    cur.close()
    print(f"  ✅ Upserted race_log for {slug}")


def main():
    args = parse_args()
    slugs = load_slugs(args)

    print(f"🔍 Processing {len(slugs)} slug(s): {', '.join(slugs)}")

    conn = connect_db(
        host=args.supabase_host,
        port=args.supabase_port,
        dbname=args.supabase_db,
        user=args.supabase_user,
        password=args.supabase_pass,
    )

    try:
        for slug in slugs:
            print(f"\n🐎 Processing slug: {slug}")
            data = get_race_record(slug)
            if data is None:
                continue

            starts = data.get("starts", [])
            print(f"  📊 Total starts in knowledge repo: {data.get('total_starts', len(starts))}")

            for start in starts:
                # Map the snake_case entry to camelCase RaceLogEntry
                mapped = map_race_entry(start)
                if not mapped:
                    print(f"  ⚠️  No mappable fields in start entry, skipping")
                    continue

                upsert_race_log(conn, slug, mapped)

        print("\n✅ Race log sync complete.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()