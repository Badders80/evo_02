#!/usr/bin/env python3
"""Migration script: merge rich pedigree + race data into local Supabase inventory."""

import json
import psycopg2
from psycopg2 import sql

# --- Configuration ---
DB_HOST = "localhost"
DB_PORT = 54322
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

PEDIGREES_PATH = "/home/evo/new/evo_01/02_website/src/data/pedigrees.json"
HORSES_PATH = "/home/evo/new/evo_01/02_website/src/data/horses.json"


def connect_db():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
    conn.autocommit = False
    return conn


def migrate_pedigrees(conn):
    """Load pedigrees.json and merge into inventory.pedigree_data."""
    with open(PEDIGREES_PATH, "r") as f:
        pedigrees = json.load(f)

    cur = conn.cursor()

    for entry in pedigrees:
        slug = entry["horse_slug"]
        loveracing_id = entry["loveracing_id"]
        performance_profile_url = entry["performance_profile_url"]
        family_number = entry.get("family_number", "")
        verified = entry.get("verified", False)
        verified_at = entry.get("verified_at", "")

        sire_line = entry.get("sire_line", [])
        dam_line = entry.get("dam_line", [])
        cross_line = entry.get("cross_line", {})

        # Build the new JSONB fields to add
        new_fields = {
            "sire_line": sire_line,
            "dam_line": dam_line,
            "cross_line": cross_line,
            "loverracing_id": loveracing_id,
            "performance_profile_url": performance_profile_url,
            "family_number": family_number,
            "verified": verified,
            "verified_at": verified_at,
        }

        # Use jsonb || to concatenate existing pedigree_data with new fields.
        # The %s placeholder will be replaced by the psycopg2 adapt mechanism.
        # We cast the new_fields dict to jsonb.
        update_sql = """
            UPDATE inventory
            SET pedigree_data = pedigree_data || %s::jsonb
            WHERE slug = %s;
        """
        cur.execute(update_sql, (json.dumps(new_fields), slug))

    conn.commit()
    cur.close()
    print(f"✅ Pedigree migration complete for {len(pedigrees)} horses.")


def migrate_race_logs(conn):
    """Load horses.json and update inventory.race_log per slug."""
    with open(HORSES_PATH, "r") as f:
        horses = json.load(f)

    cur = conn.cursor()

    for horse in horses:
        slug = horse["slug"]
        race_log = horse.get("race_log", [])

        update_sql = """
            UPDATE inventory
            SET race_log = %s::jsonb
            WHERE slug = %s;
        """
        cur.execute(update_sql, (json.dumps(race_log), slug))

    conn.commit()
    cur.close()
    print(f"✅ Race log migration complete for {len(horses)} horses.")


def verify_migration(conn):
    """Print per-slug before/after verification."""
    cur = conn.cursor()

    cur.execute(
        "SELECT slug FROM inventory ORDER BY slug;"
    )
    rows = cur.fetchall()
    print("\n=== Verification ===")
    for (slug,) in rows:
        # Get current pedigree_data
        cur.execute(
            "SELECT pedigree_data FROM inventory WHERE slug = %s;",
            (slug,),
        )
        ped_row = cur.fetchone()
        pedigree_data = ped_row[0] if ped_row else {}

        # Get race_log
        cur.execute(
            "SELECT race_log FROM inventory WHERE slug = %s;",
            (slug,),
        )
        log_row = cur.fetchone()
        race_log = log_row[0] if log_row else []

        sire_line_len = 0
        dam_line_len = 0
        if isinstance(pedigree_data, dict):
            sire_line = pedigree_data.get("sire_line", [])
            dam_line = pedigree_data.get("dam_line", [])
            if isinstance(sire_line, list):
                sire_line_len = len(sire_line)
            if isinstance(dam_line, list):
                dam_line_len = len(dam_line)

        race_log_len = len(race_log) if isinstance(race_log, list) else 0

        loverracing_id = ""
        if isinstance(pedigree_data, dict):
            loverracing_id = pedigree_data.get("loverracing_id", "")

        print(
            f"slug={slug:20s} sire_line={sire_line_len:2d} dam_line={dam_line_len:2d} "
            f"loverracing_id={loverracing_id} race_log={race_log_len:2d}"
        )

    cur.close()


def main():
    conn = connect_db()
    try:
        migrate_pedigrees(conn)
        migrate_race_logs(conn)
        verify_migration(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()