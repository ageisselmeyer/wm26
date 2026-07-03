#!/usr/bin/env python3
"""Fetch data from anstosszeiten.de and update anstosszeiten.js + scripts/anstosszeiten.json."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_JS = ROOT / "anstosszeiten.js"
OUTPUT_JSON = ROOT / "scripts" / "anstosszeiten.json"
FIXTURES_PATH = ROOT / "scripts" / "fixtures.json"
SPIELPLAN_URL = "https://anstosszeiten.de/spielplan/"

DE_TO_EN = {
    "Mexiko": "Mexico",
    "Südafrika": "South Africa",
    "Südkorea": "Korea Republic",
    "Tschechien": "Czechia",
    "Kanada": "Canada",
    "Bosnien-Herzegowina": "Bosnia and Herzegovina",
    "USA": "United States",
    "Paraguay": "Paraguay",
    "Katar": "Qatar",
    "Schweiz": "Switzerland",
    "Brasilien": "Brazil",
    "Marokko": "Morocco",
    "Haiti": "Haiti",
    "Schottland": "Scotland",
    "Australien": "Australia",
    "Türkei": "Turkiye",
    "Elfenbeinküste": "Cote d'Ivoire",
    "Ecuador": "Ecuador",
    "Deutschland": "Germany",
    "Curaçao": "Curacao",
    "Niederlande": "Netherlands",
    "Japan": "Japan",
    "Schweden": "Sweden",
    "Tunesien": "Tunisia",
    "Saudi-Arabien": "Saudi Arabia",
    "Uruguay": "Uruguay",
    "Spanien": "Spain",
    "Kap Verde": "Cabo Verde",
    "Iran": "IR Iran",
    "Neuseeland": "New Zealand",
    "Belgien": "Belgium",
    "Ägypten": "Egypt",
    "Frankreich": "France",
    "Senegal": "Senegal",
    "Irak": "Iraq",
    "Norwegen": "Norway",
    "Argentinien": "Argentina",
    "Algerien": "Algeria",
    "Österreich": "Austria",
    "Jordanien": "Jordan",
    "Ghana": "Ghana",
    "Panama": "Panama",
    "England": "England",
    "Kroatien": "Croatia",
    "Portugal": "Portugal",
    "DR Kongo": "Congo DR",
    "Usbekistan": "Uzbekistan",
    "Kolumbien": "Colombia",
}

DE_MONTHS = {
    "Januar": 1,
    "Februar": 2,
    "März": 3,
    "April": 4,
    "Mai": 5,
    "Juni": 6,
    "Juli": 7,
    "August": 8,
    "September": 9,
    "Oktober": 10,
    "November": 11,
    "Dezember": 12,
}

SPIELORT_SLUG_TO_HOST_CITY = {
    "mexiko-stadt": "mexico-city",
}

VENUE_LABEL_TO_HOST_CITY = {
    "Mexico City": "mexico-city",
    "Mexiko-Stadt": "mexico-city",
    "Guadalajara": "guadalajara",
    "Monterrey": "monterrey",
    "Toronto": "toronto",
    "Vancouver": "vancouver",
    "Los Angeles": "los-angeles",
    "San Francisco": "san-francisco",
    "Seattle": "seattle",
    "Houston": "houston",
    "Dallas": "dallas",
    "Kansas City": "kansas-city",
    "Atlanta": "atlanta",
    "Miami": "miami",
    "Boston": "boston",
    "Philadelphia": "philadelphia",
    "New York": "new-york",
    "New York/New Jersey": "new-york",
}


def normalize_host_city(slug: str | None, label: str | None) -> str | None:
    if slug:
        return SPIELORT_SLUG_TO_HOST_CITY.get(slug, slug)
    if label:
        return VENUE_LABEL_TO_HOST_CITY.get(label, label.lower().replace(" ", "-"))
    return None


def parse_venue(card: str) -> str | None:
    match = re.search(r'href="/spielort/([^/]+)/"', card)
    if match:
        return normalize_host_city(match.group(1), None)

    match = re.search(r'data-cal-venue="([^"]+)"', card)
    if match:
        return normalize_host_city(None, match.group(1))

    match = re.search(r"Spiel \d+ - [A-Za-z]{2}, \d{1,2}\. [A-Za-z]+ - ([^<]+)", card)
    if match:
        return normalize_host_city(None, match.group(1).strip())

    return None


def fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "wm26-sync/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def parse_senders(card: str) -> list[str]:
    head = card.split("Zeile 2")[0] if "Zeile 2" in card else card[:1500]
    senders: list[str] = []
    for label, key in (("ARD", "ard"), ("ZDF", "zdf"), ("MagentaTV", "magenta")):
        if re.search(r">" + label + r"<", head):
            senders.append(key)
    return senders


def parse_mesz_time(card: str) -> str | None:
    match = re.search(
        r'class="text-(?:lg|2xl) font-bold[^"]*">(\d{1,2}:\d{2})</div>\s*<div class="text-xs text-gray-400">MESZ</div>',
        card,
    )
    return match.group(1) if match else None


def parse_date_from_card(card: str, fallback: str) -> tuple[int, int, int]:
    match = re.search(r"Spiel \d+ - [A-Za-z]{2}, (\d{1,2})\. ([A-Za-z]+)", card)
    if match:
        return 2026, DE_MONTHS[match.group(2)], int(match.group(1))

    match = re.search(r"<span>([A-Za-z]{2}, \d{1,2}\. [A-Za-z]+)</span>", card)
    if match:
        parts = re.match(r"[A-Za-z]{2}, (\d{1,2})\. ([A-Za-z]+)", match.group(1))
        if parts:
            return 2026, DE_MONTHS[parts.group(2)], int(parts.group(1))

    year, month, day = map(int, fallback.split("-"))
    return year, month, day


def to_utc(card: str, fallback_date: str) -> str | None:
    mesz = parse_mesz_time(card)
    if not mesz:
        match = re.search(r'data-cal-utc="([^"]+)"', card)
        return match.group(1) if match else None

    year, month, day = parse_date_from_card(card, fallback_date)
    hour, minute = map(int, mesz.split(":"))
    local = datetime(year, month, day, hour, minute, tzinfo=ZoneInfo("Europe/Berlin"))
    return local.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_knockout_teams(card: str) -> tuple[str | None, str | None]:
    teams = re.findall(
        r'class="text-sm font-semibold text-gray-900[^"]*"[^>]*>.*?<span>([^<]+)</span>',
        card,
        re.DOTALL,
    )
    if len(teams) >= 2:
        return teams[0].strip(), teams[1].strip()
    return None, None


def team_entry(home_de: str, away_de: str) -> dict[str, str]:
    return {
        "homeDe": home_de,
        "awayDe": away_de,
        "home": DE_TO_EN.get(home_de, home_de),
        "away": DE_TO_EN.get(away_de, away_de),
    }


def find_knockout_card(cards: list[str], kickoff_utc: str, fixture_date: str) -> str | None:
    """Match TV card by kickoff time — anstosszeiten FIFA numbers can be wrong."""
    for card in cards:
        utc = to_utc(card, fixture_date)
        if utc == kickoff_utc:
            return card
    return None


def main() -> int:
    html = fetch_text(SPIELPLAN_URL)
    fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))["fixtures"]
    cards = html.split("rounded-xl border border-gray-100 bg-white p-4")[1:]

    parsed_cards = []
    for card in cards:
        cal = re.search(r'data-cal-home="([^"]+)"\s+data-cal-away="([^"]+)"', card)
        home = DE_TO_EN.get(cal.group(1), cal.group(1)) if cal else None
        away = DE_TO_EN.get(cal.group(2), cal.group(2)) if cal else None
        utc_match = re.search(r'data-cal-utc="([^"]+)"', card)
        parsed_cards.append(
            {
                "home": home,
                "away": away,
                "utc_cal": utc_match.group(1) if utc_match else None,
                "senders": parse_senders(card),
                "venue": parse_venue(card),
            }
        )

    by_pair: dict[tuple[str, str], list[dict]] = {}
    for entry in parsed_cards:
        if entry["home"] and entry["away"]:
            by_pair.setdefault(tuple(sorted([entry["home"], entry["away"]])), []).append(entry)

    broadcast: dict[str, list[str]] = {}
    kickoffs: dict[str, str] = {}
    teams: dict[str, dict[str, str]] = {}
    venues: dict[str, str] = {}

    for fixture in fixtures:
        match_number = fixture["matchNumber"]
        key = str(match_number)

        if match_number <= 72:
            entry = by_pair.get(tuple(sorted([fixture["homeTeam"], fixture["awayTeam"]])), [None])[0]
            if not entry:
                continue
            utc = entry["utc_cal"]
            senders = entry["senders"]
            venue = entry["venue"]
        else:
            card = find_knockout_card(cards, fixture["kickoffUtc"], fixture["date"])
            senders = parse_senders(card) if card else []
            utc = None
            venue = None

        broadcast[key] = senders or ["magenta"]
        if match_number <= 72:
            if utc and utc != fixture["kickoffUtc"]:
                kickoffs[key] = utc
            if venue:
                venues[key] = venue

    payload = {
        "source": SPIELPLAN_URL,
        "syncedAt": datetime.now(ZoneInfo("Europe/Berlin")).date().isoformat(),
        "broadcast": broadcast,
        "kickoffs": kickoffs,
        "teams": teams,
        "venues": venues,
    }

    OUTPUT_JSON.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    OUTPUT_JS.write_text(
        "window.ANSTOSSZEITEN_DATA = " + json.dumps(payload, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )

    print(
        f"Updated {OUTPUT_JS} ({len(broadcast)} broadcasts, "
        f"{len(kickoffs)} kickoff overrides, {len(teams)} team overrides, "
        f"{len(venues)} venues)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
