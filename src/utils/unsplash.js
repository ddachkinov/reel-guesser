const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = "https://api.unsplash.com";

// Simple in-memory cache so the same query doesn't fetch twice per session
const cache = new Map();

/**
 * Fetch a high-quality portrait photo for a given search query from Unsplash.
 * Returns { url, attribution } or null on failure.
 *
 * Picks randomly from the top 5 results so each session feels fresh.
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

    // Pick randomly from up to the first 5 filtered results for variety
    const source = filtered.length > 0 ? filtered : results;
    const pool = source.slice(0, Math.min(5, source.length));
    const photo = pool[Math.floor(Math.random() * pool.length)];

    const result = {
      url: photo.urls.regular,          // ~1080px wide, high quality
      attribution: `Photo by ${photo.user.name} on Unsplash`,
    };

    cache.set(query, result);
    return result;
  } catch {
    return null;
  }
}
