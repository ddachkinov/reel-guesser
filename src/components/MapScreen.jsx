import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversine } from "../hooks/useGameState";
import { isPointInCountry, getCountryFeature } from "../data/countryPolygons";
import styles from "./MapScreen.module.css";

// Detect system color scheme once at module level
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
const tileTheme = prefersDark ? "dark" : "light";
const labelOpacity = prefersDark ? 0.65 : 0.9;
const mapBg = prefersDark ? "#0d0d1a" : "#e8e8e8";

function makeGuessIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;
      background:#6366f1;border:3px solid #fff;border-radius:50%;
      box-shadow:0 2px 16px rgba(99,102,241,0.9),0 0 0 0 rgba(99,102,241,0.4);
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

function scoreColor(km, inside) {
  if (inside) return "#34d399";
  if (km < 500) return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

function formatResult(km, inside) {
  if (inside) return "Right country!";
  if (km < 500)  return `${km.toLocaleString()} km — So close!`;
  if (km < 2000) return `${km.toLocaleString()} km — Not bad`;
  if (km < 4000) return `${km.toLocaleString()} km — Keep practising`;
  return         `${km.toLocaleString()} km — Way off`;
}

function addCountryLayer(map, countryId, inside) {
  const f = getCountryFeature(countryId);
  if (!f) return;
  L.geoJSON(f, {
    style: {
      fillColor:   inside ? "#34d399" : "#f87171",
      fillOpacity: inside ? 0.18 : 0,
      color:       inside ? "#34d399" : "#f87171",
      weight:      inside ? 2 : 2,
      dashArray:   inside ? null : "6 4",
      opacity:     0.8,
    },
  }).addTo(map);
}

// Circular countdown ring SVG
function CountdownRing({ timeLeft, maxTime = 10, size = 44 }) {
  const radius = (size - 6) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - timeLeft / maxTime);
  const urgent = timeLeft <= 3;
  const color = urgent ? "#f87171" : "#a5b4fc";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease" }} />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        color, fontSize: 13, fontWeight: 800,
        transition: "color 0.3s ease",
      }}>
        {timeLeft}
      </span>
    </div>
  );
}

const MAP_TIMER_SECONDS = 10;

export function MapScreen({ country, maxScore, onScore, onBack, onTimeout, visible }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const lockedRef = useRef(false);
  const [guessed, setGuessed] = useState(false);
  const [result, setResult] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  // Map countdown — pauses when map is hidden (visible=false), stops when guessed
  const [timeLeft, setTimeLeft] = useState(MAP_TIMER_SECONDS);

  useEffect(() => {
    if (!visible || guessed || timedOut || timeLeft <= 0) return;
    const tid = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(tid);
  }, [visible, guessed, timedOut, timeLeft]);

  // Handle timeout: reveal answer location, then fire onTimeout
  useEffect(() => {
    if (timeLeft !== 0 || guessed || timedOut) return;
    setTimedOut(true);
    lockedRef.current = true;
    setGuessed(true);

    const [ansLat, ansLng] = country.mapCenter;
    if (mapRef.current) {
      addCountryLayer(mapRef.current, country.id, false);
      L.marker([ansLat, ansLng], {
        icon: makeAnswerIcon(country.emoji), zIndexOffset: 2000,
      }).addTo(mapRef.current);
      mapRef.current.setView([ansLat, ansLng], 3, { animate: true, duration: 0.8 });
    }
    // Short pause so user can see where the answer was
    setTimeout(() => onTimeout?.(), 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Create Leaflet map
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
      maxBounds: [[-85, -220], [85, 220]],
      maxBoundsViscosity: 0.85,
    });

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/${tileTheme}_nolabels/{z}/{x}/{y}{r}.png`,
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/${tileTheme}_only_labels/{z}/{x}/{y}{r}.png`,
      { subdomains: "abcd", maxZoom: 19, opacity: labelOpacity }
    ).addTo(map);

    map.on("click", (e) => {
      if (lockedRef.current) return;
      lockedRef.current = true;

      const { lat, lng } = e.latlng;
      const [ansLat, ansLng] = country.mapCenter;
      const km = Math.round(haversine(lat, lng, ansLat, ansLng));
      const inside = isPointInCountry(lat, lng, country.id);
      const color = scoreColor(km, inside);

      // Immediate: guess pin + hide chrome
      L.marker([lat, lng], { icon: makeGuessIcon(), zIndexOffset: 1000 }).addTo(map);
      setGuessed(true);

      // 250ms: country polygon highlight + answer emoji + line + zoom
      setTimeout(() => {
        addCountryLayer(map, country.id, inside);
        L.marker([ansLat, ansLng], {
          icon: makeAnswerIcon(country.emoji), zIndexOffset: 2000,
        }).addTo(map);
        // Only draw the connecting line when player missed the country
        if (!inside) {
          L.polyline([[lat, lng], [ansLat, ansLng]], {
            color, weight: 2.5, dashArray: "8 5", opacity: 0.85,
          }).addTo(map);
        }
        map.fitBounds([[lat, lng], [ansLat, ansLng]], {
          padding: [80, 100], animate: true, duration: 0.8,
        });
      }, 250);

      // 1100ms: slide up result bar (after zoom settles)
      setTimeout(() => {
        setResult({ km, color, text: formatResult(km, inside) });
      }, 1100);

      // 1500ms: trigger scoring → BriefReveal
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

  // Invalidate size on mount and whenever map becomes visible
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [visible]);

  const showTimer = !guessed && !timedOut;

  return (
    <div className={styles.screen} style={{ background: mapBg }}>
      <div ref={containerRef} className={styles.map} />
      <div className={styles.topFade} />

      {/* Back button — only visible before guess/timeout */}
      {!guessed && (
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to photo">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Top-right cluster: countdown ring + max score pill */}
      <div className={styles.topRight}>
        {showTimer && <CountdownRing timeLeft={timeLeft} />}
        {!guessed && (
          <div className={styles.maxScorePill}>
            Max <strong>{maxScore}</strong> pts
          </div>
        )}
      </div>

      {/* Tap hint */}
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

      {/* Result bar (slides up after zoom settles) */}
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
