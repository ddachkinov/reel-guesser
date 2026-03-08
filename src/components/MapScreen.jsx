import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversine } from "../hooks/useGameState";
import styles from "./MapScreen.module.css";

function makeGuessIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;
      background:#6366f1;border:3px solid #fff;border-radius:50%;
      box-shadow:0 2px 16px rgba(99,102,241,0.9), 0 0 0 0 rgba(99,102,241,0.4);
      transform:translate(-50%,-50%);
      animation:guessPulse 1.2s ease-out;
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function makeAnswerIcon(emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="
      font-size:36px;line-height:1;
      transform:translate(-50%,-100%);
      filter:drop-shadow(0 3px 10px rgba(0,0,0,0.9));
      animation:dropIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
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
  if (km < 100)  return `${km} km — Bullseye!`;
  if (km < 500)  return `${km.toLocaleString()} km — So close!`;
  if (km < 2000) return `${km.toLocaleString()} km — Not bad`;
  if (km < 4000) return `${km.toLocaleString()} km — Keep practising`;
  return         `${km.toLocaleString()} km — Way off`;
}

export function MapScreen({ country, maxScore, onScore, onBack, visible }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const lockedRef = useRef(false);
  const [guessed, setGuessed] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 6,
      worldCopyJump: false,
      // Prevent dragging the map off the world edges — snaps back elastically
      maxBounds: [[-85, -220], [85, 220]],
      maxBoundsViscosity: 0.85,
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

      // Immediate: drop guess pin, hide UI chrome
      L.marker([lat, lng], {
        icon: makeGuessIcon(), zIndexOffset: 1000,
      }).addTo(map);
      setGuessed(true);

      // 250ms: reveal answer emoji + dashed line + zoom to fit both pins
      setTimeout(() => {
        L.marker([ansLat, ansLng], {
          icon: makeAnswerIcon(country.emoji), zIndexOffset: 2000,
        }).addTo(map);

        L.polyline([[lat, lng], [ansLat, ansLng]], {
          color, weight: 2.5, dashArray: "8 5", opacity: 0.85,
        }).addTo(map);

        map.fitBounds([[lat, lng], [ansLat, ansLng]], {
          padding: [80, 100], animate: true, duration: 0.8,
        });
      }, 250);

      // 1100ms: show result bar (zoom animation has settled — 250 + 800ms)
      setTimeout(() => {
        setResult({ km, color, text: formatResult(km) });
      }, 1100);

      // 1500ms: trigger scoring chain → ScorePop → BriefReveal
      setTimeout(() => {
        onScore(lat, lng);
      }, 1500);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Invalidate size once on mount
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, []);

  // Invalidate size whenever the map becomes visible (e.g. after CSS transition)
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className={styles.screen}>
      <div ref={containerRef} className={styles.map} />
      <div className={styles.topFade} />

      {!guessed && (
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to clues">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {!guessed && (
        <div className={styles.maxScorePill}>
          Max <strong>{maxScore}</strong> pts
        </div>
      )}

      {!guessed && (
        <div className={styles.tapHint}>
          <span className={styles.tapIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
            </svg>
          </span>
          Tap to place your guess
        </div>
      )}

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
