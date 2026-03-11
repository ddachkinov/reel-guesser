import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

// ISO 3166-1 numeric codes for all playable countries
const ISO_BY_ID = {
  // Original 10
  japan:        "392",
  brazil:       "76",
  egypt:        "818",
  norway:       "578",
  india:        "356",
  australia:    "36",
  mexico:       "484",
  iceland:      "352",
  peru:         "604",
  morocco:      "504",
  // Batch 2 — 15 more
  thailand:     "764",
  turkey:       "792",
  greece:       "300",
  kenya:        "404",
  vietnam:      "704",
  spain:        "724",
  colombia:     "170",
  newzealand:   "554",
  southafrica:  "710",
  france:       "250",
  china:        "156",
  nepal:        "524",
  indonesia:    "360",
  tanzania:     "834",
  portugal:     "620",
};

// Pre-process once at module load — build { countryId → GeoJSON feature }
const allFeatures = feature(worldAtlas, worldAtlas.objects.countries).features;
const _featureById = {};
for (const f of allFeatures) {
  const id = Object.entries(ISO_BY_ID).find(([, iso]) => iso === String(f.id))?.[0];
  if (id) _featureById[id] = f;
}

// Ray-casting point-in-polygon for a single ring (array of [lng, lat] pairs)
function raycast([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInGeoFeature(lngLat, f) {
  if (!f?.geometry) return false;
  const { type, coordinates } = f.geometry;
  // Polygon → wrap in array so we can treat both types uniformly
  const polygons = type === "Polygon" ? [coordinates] : coordinates;
  return polygons.some((poly) => raycast(lngLat, poly[0]));
}

/** Returns the GeoJSON Feature for a country id, or null if unavailable. */
export function getCountryFeature(countryId) {
  return _featureById[countryId] ?? null;
}

/** Returns true if [lat, lng] falls inside the country's polygon. */
export function isPointInCountry(lat, lng, countryId) {
  const f = _featureById[countryId];
  if (!f) return false;
  return pointInGeoFeature([lng, lat], f); // GeoJSON uses [lng, lat]
}
