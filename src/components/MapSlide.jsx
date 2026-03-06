import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversine } from "../hooks/useGameState";
import styles from "./MapSlide.module.css";

// Custom pin icons use inline styles — avoids Leaflet's default image path issues
// and CSS module scoping problems with dynamically inserted DOM nodes.
function makeGuessIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;
      background:#6366f1;border:3px solid #fff;border-radius:50%;
      box-shadow:0 2px 12px rgba(99,102,241,0.7);
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
      font-size:28px;line-height:1;
      transform:translate(-50%,-100%);
      filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));
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

function formatDistance(km) {
  if (km < 100) return `${km} km — Bullseye! 🎯`;
  if (km < 500) return `${km.toLocaleString()} km — So close! 🔥`;
  if (km < 2000) return `${km.toLocaleString()} km — Not bad 👍`;
  if (km < 4000) return `${km.toLocaleString()} km — Keep practising 😅`;
  return `${km.toLocaleString()} km — Way off 🌊`;
}

export function MapSlide({ country, onScore, isActive }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const answerMarkerRef = useRef(null);
  const lineRef = useRef(null);
  const lockedRef = useRef(false);

  const [guessLatLng, setGuessLatLng] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);

  // Init map once
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

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    // Subtle country name labels layer on top
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19, opacity: 0.5 }
    ).addTo(map);

    map.on("click", (e) => {
      if (lockedRef.current) return;
      const { lat, lng } = e.latlng;

      if (guessMarkerRef.current) {
        guessMarkerRef.current.setLatLng([lat, lng]);
      } else {
        guessMarkerRef.current = L.marker([lat, lng], {
          icon: makeGuessIcon(),
          zIndexOffset: 1000,
        }).addTo(map);
      }

      setGuessLatLng({ lat, lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      guessMarkerRef.current = null;
      answerMarkerRef.current = null;
      lineRef.current = null;
      lockedRef.current = false;
    };
  }, []);

  // Invalidate size when slide becomes active (Leaflet needs this after display:none)
  useEffect(() => {
    if (isActive && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 50);
    }
  }, [isActive]);

  function lockIn() {
    if (!guessLatLng || lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);

    const map = mapRef.current;
    const { lat, lng } = guessLatLng;
    const [ansLat, ansLng] = country.mapCenter;
    const km = Math.round(haversine(lat, lng, ansLat, ansLng));
    const color = scoreColor(km);

    // Answer marker
    answerMarkerRef.current = L.marker([ansLat, ansLng], {
      icon: makeAnswerIcon(country.emoji),
      zIndexOffset: 2000,
    }).addTo(map);

    // Dashed line between guess and answer
    lineRef.current = L.polyline([[lat, lng], [ansLat, ansLng]], {
      color,
      weight: 2.5,
      dashArray: "8 5",
      opacity: 0.85,
    }).addTo(map);

    // Fit both points into view
    map.fitBounds([[lat, lng], [ansLat, ansLng]], {
      padding: [70, 70],
      animate: true,
      duration: 0.8,
    });

    setResult({ km, color });
    onScore(lat, lng);
  }

  return (
    <div className={styles.wrapper}>
      {/* Leaflet map */}
      <div ref={containerRef} className={styles.map} />

      {/* Overlay gradients so HUD stays readable */}
      <div className={styles.gradientTop} />

      {/* Instruction / result bubble */}
      <div className={styles.hintBar}>
        {!locked ? (
          <span className={styles.hint}>
            {guessLatLng ? "Tap again to move · " : "Tap the map to place your guess"}
            {guessLatLng && <span className={styles.hintSub}>ready to lock in</span>}
          </span>
        ) : result ? (
          <span className={styles.resultText} style={{ color: result.color }}>
            {formatDistance(result.km)}
          </span>
        ) : null}
      </div>

      {/* Lock in button — appears once pin is placed */}
      {guessLatLng && !locked && (
        <button className={styles.lockBtn} onClick={lockIn}>
          Lock in guess
        </button>
      )}

      {/* Skip link — always accessible */}
      {!locked && (
        <button className={styles.skipBtn} onClick={() => onScore(null, null)}>
          Skip
        </button>
      )}
    </div>
  );
}
