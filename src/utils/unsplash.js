const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = "https://api.unsplash.com";

// Simple in-memory cache so the same query doesn't fetch twice per session
const cache = new Map();

// localStorage key for persisting photos that came back with coordinates.
// Keyed by query; value is an array of { url, attribution, photoLat, photoLng }.
// Grows organically — future "Guess the Exact Spot" stage will pull from here.
const COORD_CACHE_KEY = "rg_photo_coords";

function loadCoordCache() {
  try { return JSON.parse(localStorage.getItem(COORD_CACHE_KEY) || "{}"); } catch { return {}; }
}
function saveCoordCache(data) {
  try { localStorage.setItem(COORD_CACHE_KEY, JSON.stringify(data)); } catch {}
}

/**
 * Fetch a high-quality portrait photo for a given search query from Unsplash.
 * Returns { url, attribution, photoLat, photoLng } or null on failure.
 * photoLat/photoLng are null when the photo has no location tag.
 *
 * Picks randomly from the top 5 results so each session feels fresh.
 * Photos with coordinates are saved to localStorage to build a future pool.
 */
export async function fetchCountryPhoto(query) {
  if (!ACCESS_KEY) return null;

  if (cache.has(query)) return cache.get(query);

  try {
    const params = new URLSearchParams({
      query,
      client_id: ACCESS_KEY,
      orientation: "portrait",
      per_page: 10,
      order_by: "relevant",
      content_filter: "high",
    });

    const res = await fetch(`${BASE_URL}/search/photos?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const results = data.results ?? [];
    if (results.length === 0) return null;

    // Filter out aerial/map/satellite shots that look like maps
    const BAD_TAGS = /\b(map|satellite|aerial view|cartography|atlas|diagram)\b/i;
    const filtered = results.filter((r) => {
      const desc = `${r.description ?? ""} ${r.alt_description ?? ""}`;
      return !BAD_TAGS.test(desc);
    });

    const source = filtered.length > 0 ? filtered : results;
    const pool = source.slice(0, Math.min(5, source.length));
    const photo = pool[Math.floor(Math.random() * pool.length)];

    // Extract coordinates if the photographer tagged a location
    const lat = photo.location?.position?.latitude;
    const lng = photo.location?.position?.longitude;
    const photoLat = lat != null && lng != null ? lat : null;
    const photoLng = lat != null && lng != null ? lng : null;

    const result = {
      url: photo.urls.regular,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      photoLat,
      photoLng,
    };

    cache.set(query, result);

    // Persist coord-tagged photos to localStorage — builds the future "exact spot" pool
    if (photoLat != null) {
      const coordCache = loadCoordCache();
      const existing = coordCache[query] ?? [];
      if (!existing.some((e) => e.url === result.url)) {
        coordCache[query] = [...existing, result].slice(-10); // keep up to 10 per query
        saveCoordCache(coordCache);
      }
    }

    return result;
  } catch {
    return null;
  }
}
