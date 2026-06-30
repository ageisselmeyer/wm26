#!/usr/bin/env python3
"""Generate fixtures.js from scripts/fixtures.json for the PWA."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "fixtures.json"
OUTPUT = ROOT / "fixtures.js"


def main() -> int:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    OUTPUT.write_text(
        "window.FIXTURES_DATA = " + json.dumps(data, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Updated {OUTPUT} ({len(data['fixtures'])} fixtures)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
