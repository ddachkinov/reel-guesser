import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversine } from "../hooks/useGameState";
import styles from "./MapSheet.module.css";

function makeGuessIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;
      background:#6366f1;border:3px solid #fff;border-radius:50%;
      box-shadow:0 2px 16px rgba(99,102,241,0.8);
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
      font-size:30px;line-height:1;
      transform:translate(-50%,-100%);
      filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8));
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

export function MapSheet({ country, maxScore, onScore, onDismiss, open }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const lockedRef = useRef(false);

  const [guessLatLng, setGuessLatLng] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);

  // Drag-to-dismiss state
  const dragRef = useRef({ startY: null, dragging: false });
  const [dragOffset, setDragOffset] = useState(0);

  // Init Leaflet once
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
      subdomains: "abcd", maxZoom: 19, opacity: 0.5,
    }).addTo(map);

    map.on("click", (e) => {
      if (lockedRef.current) return;
      const { lat, lng } = e.latlng;
      if (guessMarkerRef.current) {
        guessMarkerRef.current.setLatLng([lat, lng]);
      } else {
        guessMarkerRef.current = L.marker([lat, lng], {
          icon: makeGuessIcon(), zIndexOffset: 1000,
        }).addTo(map);
      }
      setGuessLatLng({ lat, lng });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      guessMarkerRef.current = null;
      lockedRef.current = false;
    };
  }, []);

  // Invalidate map size when sheet opens
  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 320);
    }
  }, [open]);

  // Reset state when a new country loads (open changes false→false reset)
  useEffect(() => {
    if (!open) {
      setGuessLatLng(null);
      setLocked(false);
      setResult(null);
      lockedRef.current = false;
      guessMarkerRef.current = null;
      setDragOffset(0);
    }
  }, [open, country?.id]);

  function lockIn() {
    if (!guessLatLng || lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);

    const map = mapRef.current;
    const { lat, lng } = guessLatLng;
    const [ansLat, ansLng] = country.mapCenter;
    const km = Math.round(haversine(lat, lng, ansLat, ansLng));
    const color = scoreColor(km);

    L.marker([ansLat, ansLng], {
      icon: makeAnswerIcon(country.emoji), zIndexOffset: 2000,
    }).addTo(map);

    L.polyline([[lat, lng], [ansLat, ansLng]], {
      color, weight: 2.5, dashArray: "8 5", opacity: 0.85,
    }).addTo(map);

    map.fitBounds([[lat, lng], [ansLat, ansLng]], {
      padding: [60, 60], animate: true, duration: 0.7,
    });

    setResult({ km, color });
    onScore(lat, lng);
  }

  // Handle drag on the handle bar to dismiss
  const onHandleTouchStart = useCallback((e) => {
    dragRef.current = { startY: e.touches[0].clientY, dragging: true };
  }, []);

  const onHandleTouchMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy > 0) setDragOffset(dy);
  }, []);

  const onHandleTouchEnd = useCallback(() => {
    if (dragOffset > 80) {
      onDismiss();
    }
    setDragOffset(0);
    dragRef.current.dragging = false;
  }, [dragOffset, onDismiss]);

  const sheetStyle = {
    transform: open
      ? `translateY(${dragOffset}px)`
      : "translateY(100%)",
    transition: dragOffset > 0 ? "none" : undefined,
  };

  return (
    <div className={`${styles.sheet} ${open ? styles.open : ""}`} style={sheetStyle}>
      {/* Drag handle */}
      <div
        className={styles.handle}
        onTouchStart={onHandleTouchStart}
        onTouchMove={onHandleTouchMove}
        onTouchEnd={onHandleTouchEnd}
      >
        <div className={styles.pill} />
        {!locked && (
          <div className={styles.maxScore}>
            Max <span>{maxScore}</span> pts
          </div>
        )}
        {result && (
          <div className={styles.resultLine} style={{ color: result.color }}>
            {formatResult(result.km)}
          </div>
        )}
        <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Close map">
          ✕
        </button>
      </div>

      {/* Map */}
      <div ref={containerRef} className={styles.map} />

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        {!locked ? (
          <>
            <span className={styles.tapHint}>
              {guessLatLng ? "Tap to move pin" : "Tap the map to place your pin"}
            </span>
            <button
              className={styles.lockBtn}
              onClick={lockIn}
              disabled={!guessLatLng}
            >
              Lock in
            </button>
          </>
        ) : (
          <p className={styles.lockedNote}>Swipe down or tap ✕ to see the clues again</p>
        )}
      </div>
    </div>
  );
}
