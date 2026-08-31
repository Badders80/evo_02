#!/usr/bin/env python3
"""Parse first-gear race history from scraped loveracing.nz HTML (HorseID 428364)."""
import json
import re
from bs4 import BeautifulSoup

html = open('/tmp/fg-race-history.html').read()
soup = BeautifulSoup(html, 'html.parser')
tables = soup.find_all('table', class_='table-indepth')

races = []
for t in tables:
    rows = t.find_all('tr')
    if len(rows) < 2:
        continue
    # Row 0: placing-field, date, distance, race name, video, prize pool
    cells0 = rows[0].find_all('td')
    if len(cells0) < 6:
        continue
    placing = cells0[0].get_text(strip=True)          # e.g. "9-12" or "U-8"
    date_raw = cells0[1].get_text(strip=True)         # e.g. "19 Jan 26"
    dist_raw = cells0[2].get_text(strip=True)         # e.g. "1340m"
    race_name = cells0[3].get_text(strip=True)
    pool_raw = cells0[5].get_text(strip=True)         # e.g. "$18,500"

    # Row 1: venue+track, class, form comment, jockey, prize
    cells1 = rows[1].find_all('td')
    venue_track = cells1[0].get_text(strip=True) if len(cells1) > 0 else ''
    race_class = cells1[1].get_text(strip=True) if len(cells1) > 1 else ''
    form_comment = cells1[2].get_text(strip=True) if len(cells1) > 2 else ''
    jockey = cells1[3].get_text(strip=True) if len(cells1) > 3 else ''
    prize_raw = cells1[4].get_text(strip=True) if len(cells1) > 4 else ''

    # Detail row: further-detail td with ul lists
    detail_text = ''
    if len(rows) > 2:
        detail_td = rows[2].find('td', class_='further-detail')
        if detail_td:
            detail_text = detail_td.get_text(' ', strip=True)

    # --- Parse fields ---
    # placing
    m = re.match(r'(\d+|U)-(\d+)', placing)
    finish = int(m.group(1)) if m and m.group(1) != 'U' else 0
    field_size = int(m.group(2)) if m else None

    # date
    dm = re.match(r'(\d{1,2}) ([A-Za-z]{3}) (\d{2})', date_raw)
    if dm:
        day, mon, yy = dm.groups()
        months = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
        date = f"20{yy}-{months[mon]:02d}-{int(day):02d}"
    else:
        date = date_raw

    # distance
    dist = int(re.sub(r'\D', '', dist_raw)) if re.search(r'\d', dist_raw) else None

    # venue + track condition
    venue = venue_track
    track_condition = None
    tc_match = re.search(r'(Good\d|Soft\d|Heavy10|Heavy\d|Fast\d|Dead\d|Slow\d)', venue_track)
    if tc_match:
        track_condition = tc_match.group(1)
        venue = venue_track.replace(tc_match.group(1), '').strip()

    # venue code → full name (knowledge repo convention)
    VENUE_MAP = {
        'OTAK': 'Otaki', 'WODV': 'Woodville', 'WELL': 'Wellington',
        'WANG': 'Wanganui', 'EGMN': 'Egmont', 'WAIR': 'Wairarapa',
        'FOXT': 'Foxton', 'OTAKI': 'Otaki', 'WAIK': 'Waikato',
        'WELL': 'Trentham',
        'TAUR': 'Tauranga', 'TEPA': 'Te Rapa', 'ROTO': 'Rotorua',
        'AUCK': 'Auckland', 'HAWK': 'Hawkes Bay', 'CANT': 'Canterbury',
        'OTAG': 'Otago', 'SOUT': 'Southland', 'WEST': 'Westport',
        'GREY': 'Greymouth', 'NELS': 'Nelson', 'MART': 'Marton',
        'HAST': 'Hastings', 'NEWP': 'New Plymouth', 'WAIKATO': 'Waikato',
    }
    venue = VENUE_MAP.get(venue, venue)

    # prize money (individual)
    def money(s):
        s = s.replace(',', '').replace('$', '')
        return int(float(s)) if re.search(r'\d', s) else None
    prize = money(prize_raw)
    pool = money(pool_raw)

    # starting price + rating from detail
    sp = None
    rating = None
    weight = None
    margin = None
    sp_match = re.search(r'SP:\s*\$?([\d.]+)', detail_text)
    if sp_match:
        sp = f"${sp_match.group(1)}"
    rtg_match = re.search(r'Rtg:\s*(\d+)', detail_text)
    if rtg_match:
        rating = int(rtg_match.group(1))
    wgt_match = re.search(r'Wgt:\s*([\d.]+)', detail_text)
    if wgt_match:
        weight = float(wgt_match.group(1))
    # margin: "Flat 1.4L" / "Neck" / "1.4L" patterns
    mg_match = re.search(r'(?:Flat|Head|Neck|Nose|Short Head|SHD|HD|Long Neck|1/2 Head|3/4 Length|1 1/4|2 1/4|1/2 L|1 1/2 L|2 1/2 L|3 1/2 L|4 1/2 L|5 1/2 L|6 1/2 L|7 1/2 L|8 1/2 L|9 1/2 L|10 1/2 L|11 1/2 L|12 1/2 L|13 1/2 L|14 1/2 L|15 1/2 L|16 1/2 L|17 1/2 L|18 1/2 L|19 1/2 L|20 1/2 L|21 1/2 L|22 1/2 L|23 1/2 L|24 1/2 L|25 1/2 L|26 1/2 L|27 1/2 L|28 1/2 L|29 1/2 L|30 1/2 L|\d+(?:\.\d+)?L)', detail_text)
    if mg_match:
        margin = mg_match.group(0)

    # catchweight: race name contains 'Catchweight' or 'Heat' (trials).
    # NOTE: Wgt != Car is NOT a catchweight signal — apprentice claims legitimately differ.
    name_lower = race_name.lower()
    is_catchweight = 'catchweight' in name_lower or ' heat' in name_lower or name_lower.endswith('heat')

    races.append({
        'date': date,
        'venue': venue,
        'race': race_name,
        'trackCondition': track_condition,
        'result': f"{finish}{'st' if finish == 1 else 'nd' if finish == 2 else 'rd' if finish == 3 else 'th'}" if finish else 'U',
        'margin': margin,
        'distance_m': dist,
        'race_class': race_class,
        'jockey': jockey,
        'prizemoney_nzd': prize,
        'starting_price': sp,
        'field_size': field_size,
        'rating': rating,
        'is_catchweight': is_catchweight,
    })

print(f"parsed {len(races)} races")
official = [r for r in races if not r['is_catchweight']]
print(f"official (non-catchweight): {len(official)}")
print(f"catchweight trials: {len(races) - len(official)}")
print()
print("=== OFFICIAL RACES (chronological) ===")
for r in sorted(official, key=lambda x: x['date']):
    print(f"{r['date']} {r['result']:>4} {r['venue']:<6} {r['race'][:40]:<40} ${r['prizemoney_nzd'] or 0} {r['trackCondition'] or ''}")

json.dump(races, open('/tmp/fg-races-parsed.json', 'w'), indent=1)
