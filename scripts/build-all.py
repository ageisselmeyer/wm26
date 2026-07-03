#!/usr/bin/env python3
"""Run all WM26 data builds for periodic tournament updates.

1. Fetch anstosszeiten.de → TV (KO cards matched by kickoff time from fixtures.json)
2. Sync knockout pairings from openfootball → fixtures + team overrides
3. Regenerate fixtures.js and anstosszeiten.js
4. Bump ?v= cache versions in index.html when output files change

For cron during the tournament:

    python3 scripts/build-all.py

Individual scripts (only when needed):
- build-anstosszeiten-js.py  — TV/times/venues only
- build-openfootball-teams.py — pairings only
- build-fixtures-js.py       — after manual fixtures.json edits
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
ANSTOSSZEITEN_JS = ROOT / "anstosszeiten.js"
INDEX_HTML = ROOT / "index.html"


def file_hash(path: Path) -> str:
    if not path.exists():
        return ""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_script(name: str) -> int:
    path = SCRIPTS / name
    print(f"\n==> {name}")
    result = subprocess.run([sys.executable, str(path)], cwd=ROOT)
    return result.returncode


def write_anstosszeiten_js() -> None:
    data = json.loads(ANSTOSSZEITEN_JSON.read_text(encoding="utf-8"))
    ANSTOSSZEITEN_JS.write_text(
        "window.ANSTOSSZEITEN_DATA = " + json.dumps(data, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )


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

    if run_script("build-openfootball-teams.py") != 0:
        return 1

    print("\n==> regenerate anstosszeiten.js")
    write_anstosszeiten_js()

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
