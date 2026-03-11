// scripts/generateCities.mjs
// Run once: node scripts/generateCities.mjs
// Reads all-the-cities (devDep), emits src/data/cities.json
// Format: { popular: [[name,country,lat,lng], ...], extended: [...] }

import { createRequire } from "module";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const all = require("all-the-cities");

// Sort descending by population; exclude entries without coordinates
const sorted = all
  .filter((c) => c.population > 0 && c.loc?.coordinates?.length === 2)
  .sort((a, b) => b.population - a.population);

// Compact tuple: [name, countryISO2, lat, lng]
const toTuple = (c) => [
  c.name,
  c.country,
  parseFloat(c.loc.coordinates[1].toFixed(4)), // lat
  parseFloat(c.loc.coordinates[0].toFixed(4)), // lng
];

const popular  = sorted.slice(0, 500).map(toTuple);   // ~750k+ pop — very recognisable
const extended = sorted.slice(500, 5000).map(toTuple); // ~90k–750k pop — solid challenge

const out = { popular, extended };
const outPath = resolve(__dirname, "../src/data/cities.json");
writeFileSync(outPath, JSON.stringify(out));

console.log(`✓ cities.json: ${popular.length} popular + ${extended.length} extended`);
console.log(`  top-5: ${popular.slice(0, 5).map((c) => c[0]).join(", ")}`);
console.log(`  #500:  ${popular[499][0]} (last popular)`);
console.log(`  #5000: ${extended[extended.length - 1][0]} (last extended)`);
