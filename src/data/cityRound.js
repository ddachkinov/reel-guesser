// Dynamic import so cities.json becomes a separate lazy chunk (keeps main bundle lean).
// Fired immediately so it's cached well before the first city round is needed.
const _citiesPromise = import("./cities.json").then((m) => m.default);

// ── Seen-city tracking ──────────────────────────────────────────────────────
const SEEN_KEY = "rg_seen_cities";
const SEEN_CAP = 2000;

function loadSeenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch { return new Set(); }
}
function markSeen(id) {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    if (!arr.includes(id)) {
      arr.push(id);
      if (arr.length > SEEN_CAP) arr.splice(0, arr.length - SEEN_CAP);
      localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
    }
  } catch {}
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isoToEmoji(code) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

const _regionNames = (() => {
  try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; }
})();

function countryName(iso2) {
  try { return _regionNames?.of(iso2) ?? iso2; } catch { return iso2; }
}

function cityId([name, code]) {
  return `city_${name}_${code}`.toLowerCase().replace(/\s+/g, "_");
}

// Tuple format: [name, countryISO2, lat, lng]
function tupleToRound(tuple) {
  const [name, code, lat, lng] = tuple;
  const cName = countryName(code);
  return {
    type: "city",
    id: cityId(tuple),
    answer: name,
    emoji: isoToEmoji(code),
    capital: cName,   // reused as "country name" in BriefReveal sub-line
    region: code,
    mapCenter: [lat, lng],
    clues: [{ type: "cityName", name, countryName: cName, emoji: isoToEmoji(code) }],
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
/**
 * Returns a random city round, preferring unseen cities.
 * popular tier (top-500 by population) is picked 65% of the time;
 * extended tier fills the rest.  Seen IDs are capped at SEEN_CAP = 2000.
 */
export async function getRandomCityRound() {
  const citiesData = await _citiesPromise;
  const seen = loadSeenSet();

  const preferPopular = Math.random() < 0.65;

  function pickFrom(pool) {
    const unseen = pool.filter((t) => !seen.has(cityId(t)));
    const source = unseen.length > 0 ? unseen : pool;
    // Pick from up to first 50 so the most popular aren't always chosen first
    const window = source.slice(0, Math.min(50, source.length));
    return window[Math.floor(Math.random() * window.length)];
  }

  let tuple;
  if (preferPopular) {
    const unseenPopular = citiesData.popular.filter((t) => !seen.has(cityId(t)));
    tuple = unseenPopular.length > 0
      ? pickFrom(citiesData.popular)
      : pickFrom(citiesData.extended);
  } else {
    tuple = pickFrom(citiesData.extended);
  }

  const round = tupleToRound(tuple);
  markSeen(round.id);
  return round;
}
