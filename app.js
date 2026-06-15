const FIXTURES_URL = "https://www.thestatsapi.com/world-cup/data/fixtures.json";
const RESULTS_URL = "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json";
const CUP_TXT_URL = "https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt";
const MESZ_TZ = "Europe/Berlin";
const MATCH_DURATION_MS = 105 * 60 * 1000;
const REFRESH_MS = 60 * 1000;
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
  ard: {
    cls: "ard",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/ARD_2003_logo.svg",
    alt: "ARD"
  },
  zdf: {
    cls: "zdf",
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c1/ZDF_logo.svg",
    alt: "ZDF"
  },
  magenta: {
    cls: "magenta",
    src: "https://upload.wikimedia.org/wikipedia/commons/1/13/Magenta_TV_Logo_%282021%29.svg",
    alt: "MagentaTV"
  }
};

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
  "curacao": "curaçao"
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
const statusEl = document.getElementById("status");
const headingEl = document.getElementById("heading");
const appEl = document.getElementById("app");
const scrollEl = document.querySelector(".app-scroll");
const dayPrevBtn = document.getElementById("day-prev");
const dayNextBtn = document.getElementById("day-next");
const dayTodayBtn = document.getElementById("day-today");

let dayOffset = 0;
let dataCache = null;

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

function formatDayHeading(offset, now) {
  const meszToday = formatDateInTz(now, MESZ_TZ);
  const meszSelected = shiftIsoDate(meszToday, offset);
  const dateLabel = formatMeszHeadingForIso(meszSelected);
  if (offset === 0) return `📅 Heute, ${dateLabel}`;
  if (offset === -1) return `📅 Gestern, ${dateLabel}`;
  if (offset === 1) return `📅 Morgen, ${dateLabel}`;
  return `📅 ${dateLabel}`;
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

function formatScore(score) {
  if (!score) return "-:-";
  return `${score[0]}:${score[1]}`;
}

function resolveScore(index, home, away, kickoffUtc, future) {
  if (future) return "-:-";
  return formatScore(lookupScore(index, home, away, kickoffUtc));
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

  gamesEl.innerHTML = games.map((game) => `
    <article class="game">
      <div class="game-meta">
        <span class="badge time">${game.time}</span>
        <span class="tv ${game.tv.cls}"><img class="tv-logo" src="${game.tv.src}" alt="${game.tv.alt}" loading="lazy" decoding="async"></span>
        <span class="place">${game.place}</span>
      </div>
      <div class="game-main">
        <div class="match">${game.match}</div>
        <span class="badge score${game.future ? " future" : ""}${game.germany && !game.future ? " germany" : ""}${game.live ? " live" : ""}">${game.score}</span>
      </div>
    </article>
  `).join("");
}

function buildGamesList(fixtures, scoreIndex, meszSelectedDate, now) {
  return fixtures
    .map((fixture) => {
      const kickoffUtc = new Date(fixture.kickoffUtc);
      const meszDate = formatDateInTz(kickoffUtc, MESZ_TZ);
      if (meszDate !== meszSelectedDate) return null;

      const future = kickoffUtc > now;
      const live = isLive(kickoffUtc, now);
      const tv = getBroadcast(fixture.matchNumber);

      return {
        kickoffUtc,
        time: formatMeszTime(kickoffUtc),
        tv,
        score: resolveScore(scoreIndex, fixture.homeTeam, fixture.awayTeam, kickoffUtc, future),
        future,
        live,
        germany: involvesGermany(fixture.homeTeam, fixture.awayTeam),
        match: formatMatchup(fixture.homeTeam, fixture.awayTeam),
        place: formatVenue(fixture.hostCity)
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

async function loadGames() {
  const now = new Date();
  const meszSelected = getSelectedMeszDate(now);

  headingEl.textContent = formatDayHeading(dayOffset, now);

  const { fixtures, scoreIndex } = await fetchGameData();
  const games = buildGamesList(fixtures, scoreIndex, meszSelected, now);

  const liveCount = games.filter((game) => game.live).length;
  statusEl.textContent = liveCount
    ? `${games.length} Spiele · ${liveCount} live · MESZ`
    : `${games.length} Spiele · MESZ`;

  renderGames(games, emptyDayMessage(dayOffset, now));
  updateDayNav();
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
  void loadGames();
}

function goToToday() {
  if (dayOffset === 0) return;
  dayOffset = 0;
  void loadGames();
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
    statusEl.textContent = "";
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
refresh();
setInterval(refresh, REFRESH_MS);
