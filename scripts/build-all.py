#!/usr/bin/env python3
"""Run all WM26 data builds for periodic updates during the knockout stage.

1. Fetch anstosszeiten.de → scripts/anstosszeiten.json + anstosszeiten.js
   (TV, kickoffs, venues, knockout team names when the site has them)
2. Copy resolved knockout teams into scripts/fixtures.json (for ESPN score matching)
3. Regenerate fixtures.js
4. Bump ?v= cache versions in index.html when output files change

For a cron job during the tournament, this single script is enough:

    python3 scripts/build-all.py

You only need build-fixtures-js.py alone if you edited fixtures.json by hand.
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
FIXTURES_JSON = SCRIPTS / "fixtures.json"
ANSTOSSZEITEN_JSON = SCRIPTS / "anstosszeiten.json"
INDEX_HTML = ROOT / "index.html"


def file_hash(path: Path) -> str:
    if not path.exists():
        return ""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_placeholder_team(name: str | None) -> bool:
    if not name:
        return True
    value = name.lower()
    if "/" in name and ("sieger" in value or "verlierer" in value):
        return True
    return (
        "group " in value
        or value.startswith("winner ")
        or value.startswith("loser ")
        or "runners-up" in value
        or "winners" in value
        or "third place" in value
        or value.startswith("sieger")
        or "sieger " in value
        or value.startswith("verlierer")
        or "halbfinale" in value
    )


def run_script(name: str) -> int:
    path = SCRIPTS / name
    print(f"\n==> {name}")
    result = subprocess.run([sys.executable, str(path)], cwd=ROOT)
    return result.returncode


def sync_fixtures_from_anstosszeiten() -> int:
    """Apply concrete team overrides from anstosszeiten into fixtures.json."""
    fixtures_data = json.loads(FIXTURES_JSON.read_text(encoding="utf-8"))
    anstoss_data = json.loads(ANSTOSSZEITEN_JSON.read_text(encoding="utf-8"))
    teams = anstoss_data.get("teams", {})

    updated = 0
    for fixture in fixtures_data["fixtures"]:
        match_number = fixture["matchNumber"]
        if match_number < 73:
            continue

        entry = teams.get(str(match_number))
        if not entry:
            continue

        home = entry.get("home")
        away = entry.get("away")
        if is_placeholder_team(home) or is_placeholder_team(away):
            continue

        if fixture["homeTeam"] == home and fixture["awayTeam"] == away:
            continue

        fixture["homeTeam"] = home
        fixture["awayTeam"] = away
        updated += 1
        print(f"  match {match_number}: {home} vs {away}")

    if updated:
        FIXTURES_JSON.write_text(
            json.dumps(fixtures_data, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Updated {updated} knockout fixture(s) in {FIXTURES_JSON.name}")
    else:
        print("No fixture team updates (anstosszeiten still has placeholders or nothing new)")

    return updated


def bump_cache_versions(before: dict[str, str], after: dict[str, str]) -> None:
    html = INDEX_HTML.read_text(encoding="utf-8")
    changed = False

    for js_file in ("fixtures.js", "anstosszeiten.js"):
        if before.get(js_file) == after.get(js_file):
            continue

        pattern = rf"({re.escape(js_file)}\?v=)(\d+)"
        match = re.search(pattern, html)
        if not match:
            print(f"Warning: no cache version found for {js_file} in index.html")
            continue

        new_version = int(match.group(2)) + 1
        html = re.sub(pattern, rf"\g<1>{new_version}", html, count=1)
        changed = True
        print(f"Bumped {js_file}?v={new_version}")

    if changed:
        INDEX_HTML.write_text(html, encoding="utf-8")


def main() -> int:
    hashes_before = {
        "fixtures.js": file_hash(ROOT / "fixtures.js"),
        "anstosszeiten.js": file_hash(ROOT / "anstosszeiten.js"),
    }

    if run_script("build-anstosszeiten-js.py") != 0:
        return 1

    print("\n==> sync fixtures.json from anstosszeiten teams")
    sync_fixtures_from_anstosszeiten()

    if run_script("build-fixtures-js.py") != 0:
        return 1

    hashes_after = {
        "fixtures.js": file_hash(ROOT / "fixtures.js"),
        "anstosszeiten.js": file_hash(ROOT / "anstosszeiten.js"),
    }
    bump_cache_versions(hashes_before, hashes_after)

    print("\nbuild-all: done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
