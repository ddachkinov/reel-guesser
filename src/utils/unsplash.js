const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = "https://api.unsplash.com";

// Session cache: query → full array of candidate photos (30 results, fetched once per session)
// This is the pool we draw from — we never cache a single "selected" photo.
const poolCache = new Map();

// ── Seen-photo tracking ────────────────────────────────────────────────────
// Persisted in localStorage as an ordered array of URLs (FIFO).
// Capped at SEEN_CAP so very old entries cycle out naturally.
const SEEN_KEY = "rg_seen_photos";
const SEEN_CAP = 1000;

function loadSeenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch { return new Set(); }
}

function markSeen(url) {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    if (!arr.includes(url)) {
      arr.push(url);
      if (arr.length > SEEN_CAP) arr.splice(0, arr.length - SEEN_CAP); // evict oldest
      localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
    }
  } catch {}
}

// ── Unsplash fetch ─────────────────────────────────────────────────────────
const BAD_TAGS = /\b(map|satellite|aerial view|cartography|atlas|diagram)\b/i;

async function fetchPool(query) {
  const params = new URLSearchParams({
    query,
    client_id: ACCESS_KEY,
    orientation: "portrait",
    per_page: 30,           // 3× larger pool than before
    order_by: "relevant",
    content_filter: "high",
  });

  const res = await fetch(`${BASE_URL}/search/photos?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  const results = data.results ?? [];

  // Filter out map/satellite/aerial imagery
  const filtered = results.filter((r) => {
    const desc = `${r.description ?? ""} ${r.alt_description ?? ""}`;
    return !BAD_TAGS.test(desc);
  });

  return (filtered.length > 0 ? filtered : results).map((photo) => {
    const lat = photo.location?.position?.latitude;
    const lng = photo.location?.position?.longitude;
    return {
      url:         photo.urls.regular,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      photoLat:    lat != null && lng != null ? lat : null,
      photoLng:    lat != null && lng != null ? lng : null,
    };
  });
}

// ── Public API ─────────────────────────────────────────────────────────────
/**
 * Fetch a high-quality portrait photo for a given search query from Unsplash.
 * Returns { url, attribution, photoLat, photoLng } or null on failure.
 *
 * Draws from a session pool of 30 results, always preferring photos the
 * player hasn't seen yet (tracked in localStorage, up to SEEN_CAP = 1000).
 * Once all 30 pool photos are seen, falls back to random from the pool so
 * the game never stalls.
 */
export async function fetchCountryPhoto(query) {
  if (!ACCESS_KEY) return null;

  try {
    // Fetch and cache the full pool once per session per query
    if (!poolCache.has(query)) {
      const photos = await fetchPool(query);
      if (photos.length === 0) return null;
      // Shuffle so the order isn't always "best match" first
      for (let i = photos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photos[i], photos[j]] = [photos[j], photos[i]];
      }
      poolCache.set(query, photos);
    }

    const pool = poolCache.get(query);
    const seen = loadSeenSet();

    // Prefer photos the player hasn't seen yet
    const unseen = pool.filter((p) => !seen.has(p.url));
    const candidates = unseen.length > 0 ? unseen : pool;

    const photo = candidates[Math.floor(Math.random() * candidates.length)];
    markSeen(photo.url);

    // Persist coord-tagged photos to localStorage — builds the future "exact spot" pool
    if (photo.photoLat != null) {
      try {
        const coordKey = "rg_photo_coords";
        const coordCache = JSON.parse(localStorage.getItem(coordKey) || "{}");
        const existing = coordCache[query] ?? [];
        if (!existing.some((e) => e.url === photo.url)) {
          coordCache[query] = [...existing, photo].slice(-10);
          localStorage.setItem(coordKey, JSON.stringify(coordCache));
        }
      } catch {}
    }

    return photo;
  } catch {
    return null;
  }
}
