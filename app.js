const FIXTURES_URL = "https://www.thestatsapi.com/world-cup/data/fixtures.json";
const RESULTS_URL = "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json";
const CUP_TXT_URL = "https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt";
const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const ESPN_SUMMARY_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary";
const MESZ_TZ = "Europe/Berlin";
const MATCH_DURATION_MS = 105 * 60 * 1000;
const REFRESH_MS = 60 * 1000;
const ESPN_LIVE_REFRESH_MS = 30 * 1000;
const TOURNAMENT_START = "2026-06-11";
const TOURNAMENT_END = "2026-07-19";

// Free-TV assignment per FIFA match number (Spiegel / anstosszeiten.de, June 2026)
const BROADCAST_BY_MATCH = {
  1: "zdf", 2: "magenta", 3: "ard", 4: "magenta", 5: "ard", 6: "magenta", 7: "zdf", 8: "zdf",
  9: "ard", 10: "ard", 11: "magenta", 12: "magenta", 13: "zdf", 14: "ard", 15: "zdf", 16: "ard",
  17: "magenta", 18: "magenta", 19: "ard", 20: "zdf", 21: "magenta", 22: "zdf", 23: "zdf", 24: "magenta",
  25: "zdf", 26: "magenta", 27: "zdf", 28: "magenta", 29: "ard", 30: "magenta", 31: "magenta", 32: "ard",
  33: "zdf", 34: "zdf", 35: "zdf", 36: "magenta", 37: "ard", 38: "magenta", 39: "zdf", 40: "magenta",
  41: "magenta", 42: "ard", 43: "ard", 44: "zdf", 45: "ard", 46: "magenta", 47: "ard", 48: "ard",
  49: "magenta", 50: "zdf", 51: "magenta", 52: "magenta", 53: "magenta", 54: "magenta", 55: "magenta", 56: "ard",
  57: "magenta", 58: "magenta", 59: "magenta", 60: "ard", 61: "magenta", 62: "magenta", 63: "magenta", 64: "magenta",
  65: "magenta", 66: "magenta", 67: "magenta", 68: "zdf", 69: "magenta", 70: "magenta", 71: "magenta", 72: "magenta",
  73: "magenta", 74: "magenta", 75: "zdf", 76: "magenta", 77: "magenta", 78: "magenta", 79: "magenta", 80: "magenta",
  81: "magenta", 82: "magenta", 83: "magenta", 84: "magenta", 85: "magenta", 86: "magenta", 87: "magenta", 88: "magenta",
  89: "ard", 90: "magenta", 91: "zdf", 92: "magenta", 93: "ard", 94: "magenta", 95: "zdf", 96: "magenta",
  97: "zdf", 98: "ard", 99: "zdf", 100: "ard", 101: "ard", 102: "zdf", 103: "ard", 104: "zdf"
};

const BROADCAST_CHANNELS = {
  ard: { cls: "ard", alt: "ARD", key: "ard" },
  zdf: { cls: "zdf", alt: "ZDF", key: "zdf" },
  magenta: { cls: "magenta", alt: "MagentaTV", key: "magenta" }
};

function tvLogoHtml(channel, uid) {
  const svg = TV_LOGOS[channel.key].replaceAll("magenta-icon", `mi-${uid}`);
  return `<span class="tv ${channel.cls}" role="img" aria-label="${channel.alt}"><span class="tv-logo">${svg}</span></span>`;
}

const TEAM_ALIASES = {
  "cote d ivoire": "ivory coast",
  "côte d ivoire": "ivory coast",
  "korea republic": "south korea",
  "cabo verde": "cape verde",
  "czechia": "czech republic",
  "turkiye": "turkey",
  "bosnia and herzegovina": "bosnia herzegovina",
  "bosnia herzegovina": "bosnia herzegovina",
  "ivory coast": "ivory coast",
  "cape verde": "cape verde",
  "ir iran": "iran",
  "usa": "united states",
  "curacao": "curaçao",
  "cote divoire": "ivory coast"
};

const TEAM_DE = {
  "Mexico": "Mexiko",
  "South Africa": "Südafrika",
  "Korea Republic": "Südkorea",
  "South Korea": "Südkorea",
  "Czechia": "Tschechien",
  "Czech Republic": "Tschechien",
  "Canada": "Kanada",
  "Bosnia and Herzegovina": "Bosnien und Herzegowina",
  "Qatar": "Katar",
  "Switzerland": "Schweiz",
  "United States": "USA",
  "Paraguay": "Paraguay",
  "Haiti": "Haiti",
  "Scotland": "Schottland",
  "Australia": "Australien",
  "Turkiye": "Türkei",
  "Turkey": "Türkei",
  "Brazil": "Brasilien",
  "Morocco": "Marokko",
  "Cote d'Ivoire": "Elfenbeinküste",
  "Ivory Coast": "Elfenbeinküste",
  "Ecuador": "Ecuador",
  "Germany": "Deutschland",
  "Curacao": "Curaçao",
  "Curaçao": "Curaçao",
  "Netherlands": "Niederlande",
  "Japan": "Japan",
  "Sweden": "Schweden",
  "Tunisia": "Tunesien",
  "Saudi Arabia": "Saudi-Arabien",
  "Uruguay": "Uruguay",
  "Spain": "Spanien",
  "Cabo Verde": "Kap Verde",
  "Cape Verde": "Kap Verde",
  "IR Iran": "Iran",
  "Iran": "Iran",
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
  "Colombia": "Kolumbien"
};

const TEAM_FLAGS = {
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "Korea Republic": "🇰🇷",
  "Czechia": "🇨🇿",
  "Canada": "🇨🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  "Qatar": "🇶🇦",
  "Switzerland": "🇨🇭",
  "United States": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Haiti": "🇭🇹",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Australia": "🇦🇺",
  "Turkiye": "🇹🇷",
  "Brazil": "🇧🇷",
  "Morocco": "🇲🇦",
  "Cote d'Ivoire": "🇨🇮",
  "Ecuador": "🇪🇨",
  "Germany": "🇩🇪",
  "Curacao": "🇨🇼",
  "Netherlands": "🇳🇱",
  "Japan": "🇯🇵",
  "Sweden": "🇸🇪",
  "Tunisia": "🇹🇳",
  "Saudi Arabia": "🇸🇦",
  "Uruguay": "🇺🇾",
  "Spain": "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "IR Iran": "🇮🇷",
  "New Zealand": "🇳🇿",
  "Belgium": "🇧🇪",
  "Egypt": "🇪🇬",
  "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraq": "🇮🇶",
  "Norway": "🇳🇴",
  "Argentina": "🇦🇷",
  "Algeria": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordan": "🇯🇴",
  "Ghana": "🇬🇭",
  "Panama": "🇵🇦",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatia": "🇭🇷",
  "Portugal": "🇵🇹",
  "Congo DR": "🇨🇩",
  "Uzbekistan": "🇺🇿",
  "Colombia": "🇨🇴"
};

const HOST_CITIES = {
  "mexico-city": { label: "Mexico City", flag: "🇲🇽" },
  "guadalajara": { label: "Guadalajara", flag: "🇲🇽" },
  "monterrey": { label: "Monterrey", flag: "🇲🇽" },
  "toronto": { label: "Toronto", flag: "🇨🇦" },
  "vancouver": { label: "Vancouver", flag: "🇨🇦" },
  "los-angeles": { label: "Los Angeles", flag: "🇺🇸" },
  "san-francisco": { label: "San Francisco", flag: "🇺🇸" },
  "seattle": { label: "Seattle", flag: "🇺🇸" },
  "houston": { label: "Houston", flag: "🇺🇸" },
  "dallas": { label: "Dallas", flag: "🇺🇸" },
  "kansas-city": { label: "Kansas City", flag: "🇺🇸" },
  "atlanta": { label: "Atlanta", flag: "🇺🇸" },
  "miami": { label: "Miami", flag: "🇺🇸" },
  "boston": { label: "Boston", flag: "🇺🇸" },
  "philadelphia": { label: "Philadelphia", flag: "🇺🇸" },
  "new-york": { label: "New York", flag: "🇺🇸" }
};

const gamesEl = document.getElementById("games");
const headingEl = document.getElementById("heading");
const appEl = document.getElementById("app");
const scrollEl = document.querySelector(".app-scroll");
const dayPrevBtn = document.getElementById("day-prev");
const dayNextBtn = document.getElementById("day-next");
const dayTodayBtn = document.getElementById("day-today");

let dayOffset = 0;
let dataCache = null;
let currentGames = [];
let livePollId = null;
const expandedEventIds = new Set();
const espnEventsCache = new Map();

const SWIPE_MIN_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 60;
let touchStartX = 0;
let touchStartY = 0;

function normalizeTeam(name) {
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return TEAM_ALIASES[key] || key;
}

function teamKey(a, b) {
  return [normalizeTeam(a), normalizeTeam(b)].sort().join("|");
}

function formatDateInTz(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function shiftIsoDate(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function formatMeszTime(date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: MESZ_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatMeszHeading(date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: MESZ_TZ,
    day: "numeric",
    month: "long"
  }).format(date);
}

function formatMeszWeekday(date) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: MESZ_TZ,
    weekday: "long"
  }).format(date);
}

function getMeszToday(now = new Date()) {
  return formatDateInTz(now, MESZ_TZ);
}

function getSelectedMeszDate(now = new Date()) {
  return shiftIsoDate(getMeszToday(now), dayOffset);
}

function canShiftDay(delta, now = new Date()) {
  const next = shiftIsoDate(getSelectedMeszDate(now), delta);
  return next >= TOURNAMENT_START && next <= TOURNAMENT_END;
}

function formatMeszHeadingForIso(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return formatMeszHeading(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

function formatMeszWeekdayForIso(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return formatMeszWeekday(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

function formatDayHeading(offset, now) {
  const meszToday = formatDateInTz(now, MESZ_TZ);
  const meszSelected = shiftIsoDate(meszToday, offset);
  const dateLabel = formatMeszHeadingForIso(meszSelected);
  if (offset === 0) return `📅 Heute, ${dateLabel}`;
  if (offset === -1) return `📅 Gestern, ${dateLabel}`;
  if (offset === 1) return `📅 Morgen, ${dateLabel}`;
  return `📅 ${formatMeszWeekdayForIso(meszSelected)}, ${dateLabel}`;
}

function emptyDayMessage(offset, now) {
  if (offset === 0) return "Heute keine Spiele.";
  if (offset === -1) return "Gestern keine Spiele.";
  if (offset === 1) return "Morgen keine Spiele.";
  return `Keine Spiele am ${formatMeszHeadingForIso(shiftIsoDate(formatDateInTz(now, MESZ_TZ), offset))}.`;
}

function parseOpenFootballKickoff(date, timeStr) {
  const [hm, tzPart] = timeStr.split(" ");
  const offset = Number.parseInt(tzPart.replace("UTC", ""), 10);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = hm.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute));
}

function parseCupTxtScores(text) {
  const matches = [];
  let currentDate = null;

  for (const rawLine of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    const dateMatch = line.match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(June|July)\s+(\d+)$/i);
    if (dateMatch) {
      const month = dateMatch[1].toLowerCase() === "june" ? "06" : "07";
      currentDate = `2026-${month}-${dateMatch[2].padStart(2, "0")}`;
      continue;
    }

    const kickoffMatch = line.match(/^\s*(\d{2}:\d{2})\s+UTC([+-]?\d+)\s+(.+)\s+@\s+/);
    if (!kickoffMatch || !currentDate) continue;

    const [, hm, offset, middle] = kickoffMatch;
    const scoreMatch = middle.match(/^(.+?)\s+(\d+)-(\d+)(?:\s*\((\d+)-(\d+)\))?\s+(.+)$/);
    if (!scoreMatch) continue;

    const score = {
      ft: [Number(scoreMatch[2]), Number(scoreMatch[3])]
    };
    if (scoreMatch[4] !== undefined) {
      score.ht = [Number(scoreMatch[4]), Number(scoreMatch[5])];
    }

    matches.push({
      date: currentDate,
      time: `${hm} UTC${offset}`,
      team1: scoreMatch[1].trim(),
      team2: scoreMatch[6].trim(),
      score
    });
  }

  return matches;
}

function teamLabel(name) {
  return TEAM_DE[name] || name;
}

function teamFlag(name) {
  return TEAM_FLAGS[name] || "🏳️";
}

function formatTeam(name) {
  return `<span class="team"><span class="flag" aria-hidden="true">${teamFlag(name)}</span><span class="name">${teamLabel(name)}</span></span>`;
}

function formatMatchup(home, away) {
  return `<div class="matchup">${formatTeam(home)}<span class="sep">–</span>${formatTeam(away)}</div>`;
}

function formatVenue(hostCity) {
  const city = HOST_CITIES[hostCity];
  if (!city) {
    const label = hostCity.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `<span class="venue"><span class="flag" aria-hidden="true">🏳️</span><span class="name">${label}</span></span>`;
  }
  return `<span class="venue"><span class="flag" aria-hidden="true">${city.flag}</span><span class="name">${city.label}</span></span>`;
}

function getBroadcast(matchNumber) {
  const channel = BROADCAST_BY_MATCH[matchNumber] || "magenta";
  return BROADCAST_CHANNELS[channel];
}

function hasScoreData(match) {
  return Boolean(
    match.score?.ft ||
    match.score?.ht ||
    match.goals1?.length ||
    match.goals2?.length
  );
}

function shouldReplaceScoreMatch(current, next) {
  if (!current) return true;
  if (hasScoreData(next) && !hasScoreData(current)) return true;
  return false;
}

function buildScoreIndex(matches) {
  const index = new Map();
  for (const match of matches) {
    if (!match.date || !match.time) continue;

    const kickoff = parseOpenFootballKickoff(match.date, match.time);
    const pairKey = teamKey(match.team1, match.team2);
    const key = `${pairKey}|${kickoff.toISOString()}`;

    if (shouldReplaceScoreMatch(index.get(key), match)) {
      index.set(key, match);
    }
    if (shouldReplaceScoreMatch(index.get(pairKey), match)) {
      index.set(pairKey, match);
    }
  }
  return index;
}

function lookupMatch(index, home, away, kickoffUtc) {
  const exactKey = `${teamKey(home, away)}|${kickoffUtc.toISOString()}`;
  if (index.has(exactKey)) return index.get(exactKey);

  const pairKey = teamKey(home, away);
  if (index.has(pairKey) && index.get(pairKey).team1) return index.get(pairKey);

  let best = null;
  let bestDiff = Infinity;
  for (const [key, match] of index.entries()) {
    if (!key.startsWith(`${pairKey}|`)) continue;
    const kickoff = new Date(key.slice(pairKey.length + 1));
    const diff = Math.abs(kickoff - kickoffUtc);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = match;
    }
  }
  return bestDiff <= 3 * 60 * 60 * 1000 ? best : null;
}

function extractScore(matchData, homeTeam, awayTeam) {
  if (!matchData) return null;

  const homeNorm = normalizeTeam(homeTeam);
  const t1 = normalizeTeam(matchData.team1);
  const t2 = normalizeTeam(matchData.team2);
  const homeIsT1 = homeNorm === t1;
  const homeIsT2 = homeNorm === t2;
  if (!homeIsT1 && !homeIsT2) return null;

  const mapScore = (a, b) => (homeIsT1 ? [a, b] : [b, a]);

  if (matchData.score?.ft) {
    const [s1, s2] = matchData.score.ft;
    return mapScore(s1, s2);
  }

  const g1 = matchData.goals1?.length ?? 0;
  const g2 = matchData.goals2?.length ?? 0;
  if (g1 > 0 || g2 > 0) {
    return mapScore(g1, g2);
  }

  if (matchData.score?.ht) {
    const [h1, h2] = matchData.score.ht;
    return mapScore(h1, h2);
  }

  return null;
}

function lookupScore(index, home, away, kickoffUtc) {
  return extractScore(lookupMatch(index, home, away, kickoffUtc), home, away);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function teamLabelFromAny(name) {
  if (!name) return "";
  for (const [en, de] of Object.entries(TEAM_DE)) {
    if (normalizeTeam(en) === normalizeTeam(name)) return de;
  }
  return name;
}

function meszDateToEspnParam(isoDate) {
  return isoDate.replace(/-/g, "");
}

function parseEspnDetails(details, teamById) {
  return (details || []).map((detail) => ({
    minute: detail.clock?.displayValue || "",
    type: detail.type?.text || "",
    scoringPlay: Boolean(detail.scoringPlay),
    yellowCard: Boolean(detail.yellowCard),
    redCard: Boolean(detail.redCard),
    ownGoal: Boolean(detail.ownGoal),
    athlete: detail.athletesInvolved?.[0]?.displayName || null,
    team: teamById.get(detail.team?.id) || null
  }));
}

function parseEspnEvent(event) {
  const comp = event.competitions[0];
  const status = comp.status;
  const teamById = new Map();
  let homeTeam = "";
  let awayTeam = "";
  let homeScore = 0;
  let awayScore = 0;

  for (const competitor of comp.competitors) {
    const name = competitor.team.displayName;
    const score = Number.parseInt(competitor.score, 10) || 0;
    teamById.set(competitor.team.id, name);
    if (competitor.homeAway === "home") {
      homeTeam = name;
      homeScore = score;
    } else {
      awayTeam = name;
      awayScore = score;
    }
  }

  const details = parseEspnDetails(comp.details, teamById);

  return {
    eventId: event.id,
    kickoffUtc: new Date(event.date),
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    state: status.type.state,
    displayClock: status.displayClock,
    shortDetail: status.type.shortDetail,
    teamById,
    details,
    hasEvents: details.length > 0
  };
}

function buildEspnIndex(rawEvents) {
  const index = new Map();
  const seen = new Set();

  for (const event of rawEvents) {
    if (!event?.competitions?.[0] || seen.has(event.id)) continue;
    seen.add(event.id);

    const parsed = parseEspnEvent(event);
    const pairKey = teamKey(parsed.homeTeam, parsed.awayTeam);
    const exactKey = `${pairKey}|${parsed.kickoffUtc.toISOString()}`;

    index.set(exactKey, parsed);

    const existing = index.get(pairKey);
    const rank = { in: 3, post: 2, pre: 1 };
    if (!existing || (rank[parsed.state] || 0) >= (rank[existing.state] || 0)) {
      index.set(pairKey, parsed);
    }
  }

  return index;
}

async function fetchEspnScoreboard(meszDate) {
  const dates = [shiftIsoDate(meszDate, -1), meszDate, shiftIsoDate(meszDate, 1)];
  const uniqueParams = [...new Set(dates.map(meszDateToEspnParam))];

  const responses = await Promise.all(
    uniqueParams.map((param) => fetch(`${ESPN_SCOREBOARD_URL}?dates=${param}`))
  );

  const events = [];
  for (const res of responses) {
    if (!res.ok) continue;
    const data = await res.json();
    events.push(...(data.events || []));
  }

  return buildEspnIndex(events);
}

function lookupEspnMatch(index, home, away, kickoffUtc) {
  const pairKey = teamKey(home, away);
  const exactKey = `${pairKey}|${kickoffUtc.toISOString()}`;
  if (index.has(exactKey)) return index.get(exactKey);

  if (index.has(pairKey)) return index.get(pairKey);

  let best = null;
  let bestDiff = Infinity;
  for (const [key, match] of index.entries()) {
    if (!key.startsWith(`${pairKey}|`)) continue;
    const diff = Math.abs(match.kickoffUtc - kickoffUtc);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = match;
    }
  }
  return bestDiff <= 3 * 60 * 60 * 1000 ? best : null;
}

function orientEspnScore(espnMatch, home, away) {
  if (normalizeTeam(home) === normalizeTeam(espnMatch.homeTeam)) {
    return [espnMatch.homeScore, espnMatch.awayScore];
  }
  return [espnMatch.awayScore, espnMatch.homeScore];
}

function extractSummaryEvents(keyEvents) {
  return (keyEvents || [])
    .filter((event) => event.scoringPlay)
    .map((event) => ({
      minute: event.clock?.displayValue || "",
      type: event.type?.text || "Goal",
      scoringPlay: true,
      yellowCard: false,
      redCard: false,
      ownGoal: false,
      athlete: event.participants?.[0]?.athlete?.displayName || null,
      team: event.team?.displayName || null
    }));
}

async function fetchEspnEvents(eventId) {
  if (espnEventsCache.has(eventId)) return espnEventsCache.get(eventId);

  const res = await fetch(`${ESPN_SUMMARY_URL}?event=${eventId}`);
  if (!res.ok) throw new Error("Ereignisse konnten nicht geladen werden.");

  const data = await res.json();
  const events = extractSummaryEvents(data.keyEvents);
  espnEventsCache.set(eventId, events);
  return events;
}

function athleteLastName(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

function formatGoalScorer(event) {
  const country = event.team ? teamLabelFromAny(event.team) : "";
  if (country && event.athlete) {
    return `${escapeHtml(country)} (${escapeHtml(athleteLastName(event.athlete))})`;
  }
  if (country) return escapeHtml(country);
  if (event.athlete) return escapeHtml(athleteLastName(event.athlete));
  return escapeHtml(event.type);
}

function formatEventRows(events) {
  if (!events.length) {
    return `<p class="game-events-empty">Keine Tore gemeldet.</p>`;
  }

  const rows = events
    .filter((event) => event.scoringPlay)
    .map((event) => {
      const icon = event.ownGoal ? "⚽ (ET)" : "⚽";
      const scorer = formatGoalScorer(event);
      return `<li class="game-event"><span class="game-event-min">${escapeHtml(event.minute)}</span><span class="game-event-text">${icon} ${scorer}</span></li>`;
    })
    .join("");

  return `<ul class="game-events-list">${rows}</ul>`;
}

function scoreClassList(game) {
  return [
    "badge",
    "score",
    game.future ? "future" : "",
    game.germany ? "germany" : "",
    game.live ? "live" : "",
    game.scoreClickable ? "score-btn" : ""
  ].filter(Boolean).join(" ");
}

function formatScore(score) {
  if (!score) return "-:-";
  return `${score[0]}:${score[1]}`;
}

function resolveScore(scoreIndex, espnMatch, home, away, kickoffUtc, now) {
  if (espnMatch && (espnMatch.state === "in" || espnMatch.state === "post")) {
    return formatScore(orientEspnScore(espnMatch, home, away));
  }

  const openFootballScore = lookupScore(scoreIndex, home, away, kickoffUtc);
  if (openFootballScore) return formatScore(openFootballScore);
  if (kickoffUtc > now) return "-:-";
  return "-:-";
}

function isLive(kickoffUtc, now) {
  return kickoffUtc <= now && now < new Date(kickoffUtc.getTime() + MATCH_DURATION_MS);
}

function involvesGermany(home, away) {
  return home === "Germany" || away === "Germany";
}

function renderGames(games, emptyMessage) {
  if (!games.length) {
    gamesEl.innerHTML = `<p class="empty">${emptyMessage}</p>`;
    return;
  }

  gamesEl.innerHTML = games.map((game) => {
    const scoreInner = game.live && game.statusLabel && game.score !== "-:-"
      ? `${escapeHtml(game.score)} · ${escapeHtml(game.statusLabel)}`
      : escapeHtml(game.score);

    const scoreEl = game.scoreClickable
      ? `<button type="button" class="${scoreClassList(game)}" data-event-id="${game.espnEventId}" aria-expanded="${expandedEventIds.has(game.espnEventId) ? "true" : "false"}" aria-label="Spielereignisse anzeigen">${scoreInner}</button>`
      : `<span class="${scoreClassList(game)}">${scoreInner}</span>`;

    const eventsPanel = game.scoreClickable
      ? `<div class="game-events" data-events-for="${game.espnEventId}" ${expandedEventIds.has(game.espnEventId) ? "" : "hidden"}></div>`
      : "";

    return `
    <article class="game" data-game-id="${game.espnEventId || ""}">
      <div class="game-meta">
        <span class="badge time">${game.time}</span>
        ${game.tvHtml}
        <span class="place">${game.place}</span>
      </div>
      <div class="game-main">
        <div class="match">${game.match}</div>
        ${scoreEl}
      </div>
      ${eventsPanel}
    </article>
  `;
  }).join("");

  for (const eventId of expandedEventIds) {
    void populateEventsPanel(eventId);
  }
}

async function populateEventsPanel(eventId) {
  const panel = gamesEl.querySelector(`[data-events-for="${eventId}"]`);
  if (!panel) return;

  const game = currentGames.find((g) => g.espnEventId === eventId);
  let events = game?.espnDetails?.length ? game.espnDetails : espnEventsCache.get(eventId);

  if (!events?.length) {
    panel.innerHTML = `<p class="game-events-loading">Lade Ereignisse …</p>`;
    try {
      events = await fetchEspnEvents(eventId);
    } catch {
      panel.innerHTML = `<p class="game-events-empty">Ereignisse nicht verfügbar.</p>`;
      return;
    }
  }

  panel.innerHTML = formatEventRows(events);
}

function buildGamesList(fixtures, scoreIndex, espnIndex, meszSelectedDate, now) {
  return fixtures
    .map((fixture) => {
      const kickoffUtc = new Date(fixture.kickoffUtc);
      const meszDate = formatDateInTz(kickoffUtc, MESZ_TZ);
      if (meszDate !== meszSelectedDate) return null;

      const espnMatch = lookupEspnMatch(espnIndex, fixture.homeTeam, fixture.awayTeam, kickoffUtc);
      const espnLive = espnMatch?.state === "in";
      const espnDone = espnMatch?.state === "post";
      const live = espnLive || isLive(kickoffUtc, now);
      const future = kickoffUtc > now && !espnLive && !espnDone;
      const tv = getBroadcast(fixture.matchNumber);

      return {
        kickoffUtc,
        time: formatMeszTime(kickoffUtc),
        tv,
        tvHtml: tvLogoHtml(tv, fixture.matchNumber),
        score: resolveScore(scoreIndex, espnMatch, fixture.homeTeam, fixture.awayTeam, kickoffUtc, now),
        future,
        live,
        germany: involvesGermany(fixture.homeTeam, fixture.awayTeam),
        match: formatMatchup(fixture.homeTeam, fixture.awayTeam),
        place: formatVenue(fixture.hostCity),
        espnEventId: espnMatch?.eventId || null,
        espnDetails: espnMatch?.details || [],
        statusLabel: espnLive ? (espnMatch.displayClock || espnMatch.shortDetail) : null,
        scoreClickable: Boolean(espnMatch?.eventId && (espnLive || espnDone))
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.kickoffUtc - b.kickoffUtc);
}

async function fetchGameData() {
  if (dataCache && Date.now() - dataCache.at < REFRESH_MS) {
    return dataCache;
  }

  const [fixturesRes, resultsRes, cupTxtRes] = await Promise.all([
    fetch(FIXTURES_URL),
    fetch(RESULTS_URL),
    fetch(CUP_TXT_URL)
  ]);

  if (!fixturesRes.ok || !resultsRes.ok || !cupTxtRes.ok) {
    throw new Error("Daten konnten nicht geladen werden.");
  }

  const fixturesData = await fixturesRes.json();
  const resultsData = await resultsRes.json();
  const cupTxtMatches = parseCupTxtScores(await cupTxtRes.text());
  const scoreIndex = buildScoreIndex([
    ...cupTxtMatches,
    ...(resultsData.matches || [])
  ]);

  dataCache = {
    at: Date.now(),
    fixtures: fixturesData.fixtures,
    scoreIndex
  };
  return dataCache;
}

async function loadGames({ fixturesOnly = false } = {}) {
  const now = new Date();
  const meszSelected = getSelectedMeszDate(now);

  headingEl.textContent = formatDayHeading(dayOffset, now);

  const espnIndexPromise = fetchEspnScoreboard(meszSelected).catch(() => new Map());

  let fixtures;
  let scoreIndex;
  if (fixturesOnly && dataCache) {
    ({ fixtures, scoreIndex } = dataCache);
  } else {
    ({ fixtures, scoreIndex } = await fetchGameData());
  }

  const espnIndex = await espnIndexPromise;
  currentGames = buildGamesList(fixtures, scoreIndex, espnIndex, meszSelected, now);

  renderGames(currentGames, emptyDayMessage(dayOffset, now));
  updateDayNav();
  scheduleLivePoll(currentGames.some((game) => game.live));
}

function scheduleLivePoll(hasLive) {
  if (livePollId) {
    clearInterval(livePollId);
    livePollId = null;
  }
  if (!hasLive) return;

  livePollId = setInterval(() => {
    void loadGames({ fixturesOnly: true });
  }, ESPN_LIVE_REFRESH_MS);
}

function setupScoreInteractions() {
  if (gamesEl.dataset.scoreBound) return;
  gamesEl.dataset.scoreBound = "1";

  gamesEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".score-btn");
    if (!btn) return;

    const eventId = btn.dataset.eventId;
    const panel = gamesEl.querySelector(`[data-events-for="${eventId}"]`);
    if (!panel) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    if (expanded) {
      expandedEventIds.delete(eventId);
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      return;
    }

    expandedEventIds.add(eventId);
    btn.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    void populateEventsPanel(eventId);
  });
}

function updateDayNav() {
  const now = new Date();
  if (dayPrevBtn) dayPrevBtn.disabled = !canShiftDay(-1, now);
  if (dayNextBtn) dayNextBtn.disabled = !canShiftDay(1, now);
  if (dayTodayBtn) dayTodayBtn.disabled = dayOffset === 0;
}

function changeDay(delta) {
  if (!canShiftDay(delta)) return;
  dayOffset += delta;
  expandedEventIds.clear();
  void loadGames();
}

function goToToday() {
  if (dayOffset === 0) return;
  dayOffset = 0;
  expandedEventIds.clear();
  void loadGames();
}

function setupButtonBlur() {
  appEl?.addEventListener("touchend", (event) => {
    event.target.closest("button")?.blur();
  }, { passive: true });
}

function setupDayNav() {
  dayPrevBtn?.addEventListener("click", () => changeDay(-1));
  dayNextBtn?.addEventListener("click", () => changeDay(1));
  dayTodayBtn?.addEventListener("click", goToToday);
}

function setupDaySwipe() {
  if (!scrollEl) return;

  scrollEl.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  scrollEl.addEventListener("touchend", (event) => {
    if (event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    if (Math.abs(dy) > SWIPE_MAX_VERTICAL_PX && Math.abs(dy) > Math.abs(dx)) return;
    changeDay(dx < 0 ? 1 : -1);
  }, { passive: true });
}

async function refresh() {
  try {
    dataCache = null;
    await loadGames();
  } catch (error) {
    gamesEl.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

let viewportReady = false;

const VIEWPORT_STABLE_FRAMES = 4;
const VIEWPORT_STABLE_MAX_MS = 600;
const VIEWPORT_POST_STABLE_MS = 120;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStableViewport() {
  const start = performance.now();
  let last = -1;
  let stableFrames = 0;

  while (performance.now() - start < VIEWPORT_STABLE_MAX_MS) {
    await new Promise(requestAnimationFrame);
    const h = window.innerHeight;
    if (h === last) {
      stableFrames += 1;
      if (stableFrames >= VIEWPORT_STABLE_FRAMES) {
        await delay(VIEWPORT_POST_STABLE_MS);
        return;
      }
    } else {
      last = h;
      stableFrames = 1;
    }
  }
}

async function stabilizeViewport() {
  if (viewportReady) return;

  appEl?.classList.remove("ready");
  await waitForStableViewport();
  appEl?.offsetHeight;
  appEl?.classList.add("ready");
  viewportReady = true;
}

window.addEventListener("pageshow", () => {
  if (!viewportReady) void stabilizeViewport();
});

void stabilizeViewport();
setupDaySwipe();
setupDayNav();
setupButtonBlur();
setupScoreInteractions();
refresh();
setInterval(refresh, REFRESH_MS);
