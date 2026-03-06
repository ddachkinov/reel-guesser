import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversine } from "../hooks/useGameState";
import styles from "./MapScreen.module.css";

function makeGuessIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;
      background:#6366f1;border:3px solid #fff;border-radius:50%;
      box-shadow:0 2px 16px rgba(99,102,241,0.9);
      transform:translate(-50%,-50%);
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function makeAnswerIcon(emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="
      font-size:32px;line-height:1;
      transform:translate(-50%,-100%);
      filter:drop-shadow(0 2px 8px rgba(0,0,0,0.9));
      animation:dropIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    ">${emoji}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function scoreColor(km) {
  if (km < 500) return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

function formatResult(km) {
  if (km < 100)  return `${km} km — Bullseye! 🎯`;
  if (km < 500)  return `${km.toLocaleString()} km — So close! 🔥`;
  if (km < 2000) return `${km.toLocaleString()} km — Not bad 👍`;
  if (km < 4000) return `${km.toLocaleString()} km — Keep practising 😅`;
  return         `${km.toLocaleString()} km — Way off 🌊`;
}

// Full-screen map reel slide.
// Tapping the map is the final, immediate answer — no confirmation needed.
// A fresh Leaflet instance is created per country (key prop handles unmount/remount).
export function MapScreen({ country, maxScore, onScore, onBack }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const lockedRef = useRef(false);
  const [guessed, setGuessed] = useState(false);
  const [result, setResult] = useState(null); // { km, color, text }

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 6,
      worldCopyJump: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19,
    }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19, opacity: 0.45,
    }).addTo(map);

    map.on("click", (e) => {
      if (lockedRef.current) return;
      lockedRef.current = true;

      const { lat, lng } = e.latlng;
      const [ansLat, ansLng] = country.mapCenter;
      const km = Math.round(haversine(lat, lng, ansLat, ansLng));
      const color = scoreColor(km);

      // Drop guess pin
      L.marker([lat, lng], {
        icon: makeGuessIcon(), zIndexOffset: 1000,
      }).addTo(map);

      // Drop answer emoji
      L.marker([ansLat, ansLng], {
        icon: makeAnswerIcon(country.emoji), zIndexOffset: 2000,
      }).addTo(map);

      // Draw distance line
      L.polyline([[lat, lng], [ansLat, ansLng]], {
        color, weight: 2.5, dashArray: "8 5", opacity: 0.85,
      }).addTo(map);

      // Fit both points in view
      map.fitBounds([[lat, lng], [ansLat, ansLng]], {
        padding: [80, 80], animate: true, duration: 0.7,
      });

      setResult({ km, color, text: formatResult(km) });
      setGuessed(true);
      onScore(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);                         // eslint-disable-line react-hooks/exhaustive-deps

  // Invalidate size once mounted (the slide animation can cause wrong dimensions)
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.screen}>
      {/* Map fills everything */}
      <div ref={containerRef} className={styles.map} />

      {/* Top gradient so HUD stays readable */}
      <div className={styles.topFade} />

      {/* Back button — only before guessing */}
      {!guessed && (
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to clues">
          ←
        </button>
      )}

      {/* Max score pill */}
      {!guessed && (
        <div className={styles.maxScorePill}>
          Max <strong>{maxScore}</strong> pts
        </div>
      )}

      {/* Tap hint */}
      {!guessed && (
        <div className={styles.tapHint}>Tap the map to mark your answer</div>
      )}

      {/* Result overlay after tap */}
      {result && (
        <div className={styles.resultBar} style={{ borderColor: result.color }}>
          <span className={styles.resultText} style={{ color: result.color }}>
            {result.text}
          </span>
        </div>
      )}
    </div>
  );
}
