#!/usr/bin/env python3
"""Fetch knockout pairings from openfootball cup_finals.txt and update project data."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
FIXTURES_JSON = SCRIPTS / "fixtures.json"
ANSTOSSZEITEN_JSON = SCRIPTS / "anstosszeiten.json"
ANSTOSSZEITEN_JS = ROOT / "anstosszeiten.js"
CUP_FINALS_URL = (
    "https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup_finals.txt"
)

OPENFOOTBALL_TO_APP = {
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
    "Ivory Coast": "Cote d'Ivoire",
    "DR Congo": "Congo DR",
    "USA": "United States",
    "Cape Verde": "Cabo Verde",
}

EN_TO_DE = {
    "Mexico": "Mexiko",
    "South Africa": "Südafrika",
    "Korea Republic": "Südkorea",
    "Czechia": "Tschechien",
    "Canada": "Kanada",
    "Bosnia and Herzegovina": "Bosnien-Herzegowina",
    "Qatar": "Katar",
    "Switzerland": "Schweiz",
    "United States": "USA",
    "Paraguay": "Paraguay",
    "Haiti": "Haiti",
    "Scotland": "Schottland",
    "Australia": "Australien",
    "Turkiye": "Türkei",
    "Brazil": "Brasilien",
    "Morocco": "Marokko",
    "Cote d'Ivoire": "Elfenbeinküste",
    "Ecuador": "Ecuador",
    "Germany": "Deutschland",
    "Curacao": "Curaçao",
    "Netherlands": "Niederlande",
    "Japan": "Japan",
    "Sweden": "Schweden",
    "Tunisia": "Tunesien",
    "Saudi Arabia": "Saudi-Arabien",
    "Uruguay": "Uruguay",
    "Spain": "Spanien",
    "Cabo Verde": "Kap Verde",
    "IR Iran": "Iran",
    "New Zealand": "Neuseeland",
    "Belgium": "Belgien",
    "Egypt": "Ägypten",
    "France": "Frankreich",
    "Senegal": "Senegal",
    "Iraq": "Irak",
    "Norway": "Norwegen",
    "Argentina": "Argentinien",
    "Algeria": "Algerien",
    "Austria": "Österreich",
    "Jordan": "Jordanien",
    "Ghana": "Ghana",
    "Panama": "Panama",
    "England": "England",
    "Croatia": "Kroatien",
    "Portugal": "Portugal",
    "Congo DR": "DR Kongo",
    "Uzbekistan": "Usbekistan",
    "Colombia": "Kolumbien",
}


def fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "wm26-sync/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def is_placeholder_team(name: str | None) -> bool:
    if not name:
        return True
    value = name.strip()
    lowered = value.lower()
    if re.fullmatch(r"[wl]\d+", lowered.replace(" ", "")):
        return True
    if re.fullmatch(r"w\d+", lowered) or re.fullmatch(r"l\d+", lowered):
        return True
    if "/" in value and ("sieger" in lowered or "verlierer" in lowered):
        return True
    return (
        "group " in lowered
        or lowered.startswith("winner ")
        or lowered.startswith("loser ")
        or "runners-up" in lowered
        or "winners" in lowered
        or "third place" in lowered
        or lowered.startswith("sieger")
        or "sieger " in lowered
        or lowered.startswith("verlierer")
        or "halbfinale" in lowered
    )


def to_app_team(name: str) -> str:
    return OPENFOOTBALL_TO_APP.get(name, name)


def team_entry(home: str, away: str) -> dict[str, str]:
    return {
        "homeDe": EN_TO_DE.get(home, home),
        "awayDe": EN_TO_DE.get(away, away),
        "home": home,
        "away": away,
    }


def parse_cup_finals_teams(text: str) -> dict[int, tuple[str, str]]:
    """Parse knockout pairings from cup_finals.txt."""
    teams: dict[int, tuple[str, str]] = {}
    winners: dict[int, str] = {}
    losers: dict[int, str] = {}

    for line in text.splitlines():
        match = re.match(r"\s*\((\d+)\)\s+", line)
        if not match:
            continue

        match_number = int(match.group(1))
        if match_number < 73:
            continue

        rest = line[match.end() :]
        rest = re.sub(r"^\d{1,2}:\d{2}\s+UTC[^\s]+\s+", "", rest)
        rest = rest.split("@", 1)[0].strip()
        rest = rest.split("##", 1)[0].strip()
        if not rest:
            continue

        result = parse_scored_match(rest)
        if result:
            home, away, winner = result
            winners[match_number] = winner
            losers[match_number] = away if winner == home else home
            teams[match_number] = (home, away)
            continue

        if " v " not in rest.lower():
            continue

        versus = re.match(r"^(.+?)\s+v\s+(.+)$", rest, re.IGNORECASE)
        if not versus:
            continue

        home_raw = versus.group(1).strip()
        away_raw = versus.group(2).strip()
        home = resolve_bracket_slot(home_raw, winners, losers) or to_app_team(home_raw)
        away = resolve_bracket_slot(away_raw, winners, losers) or to_app_team(away_raw)
        if is_placeholder_team(home) or is_placeholder_team(away):
            continue

        teams[match_number] = (home, away)

    return teams


def resolve_bracket_slot(
    name: str, winners: dict[int, str], losers: dict[int, str]
) -> str | None:
    ref = parse_bracket_reference(name)
    if not ref:
        return None
    kind, match_number = ref
    if kind == "winner":
        return winners.get(match_number)
    return losers.get(match_number)


def parse_bracket_reference(name: str) -> tuple[str, int] | None:
    value = name.strip()
    if match := re.fullmatch(r"W(\d+)", value, re.IGNORECASE):
        return "winner", int(match.group(1))
    if match := re.fullmatch(r"L(\d+)", value, re.IGNORECASE):
        return "loser", int(match.group(1))
    if match := re.fullmatch(r"Winner Match (\d+)", value, re.IGNORECASE):
        return "winner", int(match.group(1))
    if match := re.fullmatch(r"Loser Match (\d+)", value, re.IGNORECASE):
        return "loser", int(match.group(1))
    return None


def parse_scored_match(rest: str) -> tuple[str, str, str] | None:
    pen = re.search(r",\s*(\d+-\d+)\s+pen\.\s+(.+)$", rest, re.IGNORECASE)
    if pen:
        away = to_app_team(pen.group(2).strip())
        head = rest[: pen.start()].strip()
        home_match = re.match(r"^(.+?)\s+\d+-\d+", head)
        if not home_match:
            return None
        home = to_app_team(home_match.group(1).strip())
        pen_home, pen_away = map(int, pen.group(1).split("-"))
        winner = away if pen_away > pen_home else home
        return home, away, winner

    score = re.search(r"(\d+)-(\d+)", rest)
    if not score:
        return None

    home = to_app_team(rest[: score.start()].strip())
    home_score, away_score = int(score.group(1)), int(score.group(2))
    tail = rest[score.end() :].strip()
    away_match = re.search(r"\)\s*(.+)$", tail)
    if away_match:
        away = to_app_team(away_match.group(1).strip())
    else:
        away = to_app_team(re.sub(r"^a\.e\.t\.\s*", "", tail, flags=re.IGNORECASE).strip())

    if home_score == away_score:
        return None
    winner = home if home_score > away_score else away
    return home, away, winner


def write_anstosszeiten_js(data: dict) -> None:
    ANSTOSSZEITEN_JS.write_text(
        "window.ANSTOSSZEITEN_DATA = " + json.dumps(data, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )


def sync_openfootball_teams() -> int:
    text = fetch_text(CUP_FINALS_URL)
    parsed = parse_cup_finals_teams(text)

    fixtures_data = json.loads(FIXTURES_JSON.read_text(encoding="utf-8"))
    anstoss_data = json.loads(ANSTOSSZEITEN_JSON.read_text(encoding="utf-8"))
    anstoss_teams: dict[str, dict[str, str]] = anstoss_data.setdefault("teams", {})

    fixture_updates = 0
    team_override_updates = 0
    team_override_removals = 0

    for fixture in fixtures_data["fixtures"]:
        match_number = fixture["matchNumber"]
        if match_number < 73:
            continue

        key = str(match_number)
        pairing = parsed.get(match_number)

        if pairing:
            home, away = pairing
            if fixture["homeTeam"] != home or fixture["awayTeam"] != away:
                fixture["homeTeam"] = home
                fixture["awayTeam"] = away
                fixture_updates += 1
                print(f"  fixtures {match_number}: {home} vs {away}")

            entry = team_entry(home, away)
            if anstoss_teams.get(key) != entry:
                anstoss_teams[key] = entry
                team_override_updates += 1
            continue

        existing = anstoss_teams.get(key)
        if existing and (
            is_placeholder_team(existing.get("home"))
            or is_placeholder_team(existing.get("away"))
        ):
            del anstoss_teams[key]
            team_override_removals += 1

    if fixture_updates:
        FIXTURES_JSON.write_text(
            json.dumps(fixtures_data, indent=2) + "\n",
            encoding="utf-8",
        )

    if team_override_updates or team_override_removals:
        anstoss_data["teams"] = anstoss_teams
        ANSTOSSZEITEN_JSON.write_text(
            json.dumps(anstoss_data, indent=2) + "\n",
            encoding="utf-8",
        )
        write_anstosszeiten_js(anstoss_data)

    print(
        f"openfootball: {len(parsed)} resolved pairings, "
        f"{fixture_updates} fixture update(s), "
        f"{team_override_updates} team override(s), "
        f"{team_override_removals} placeholder removal(s)"
    )
    return fixture_updates + team_override_updates + team_override_removals


def main() -> int:
    sync_openfootball_teams()
    return 0


if __name__ == "__main__":
    sys.exit(main())
