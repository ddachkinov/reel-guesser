import { useState, useEffect, useCallback, useRef } from "react";
import { ReelSlide } from "./ReelSlide";
import { MapScreen } from "./MapScreen";
import { ScorePop } from "./ScorePop";
import { BriefReveal } from "./BriefReveal";
import { MilestoneBurst } from "./MilestoneBurst";
import { GaveUpOverlay } from "./GaveUpOverlay";
import { useSwipe } from "../hooks/useSwipe";
import { PHASE } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

const PHOTO_TIMER_SECONDS = 10;
const AUTO_ADVANCE_DELAY = 5000;

// Circular countdown ring — used in both photo and map views
function CountdownRing({ timeLeft, maxTime = 10, size = 48 }) {
  const radius = (size - 6) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - timeLeft / maxTime);
  const urgent = timeLeft <= 3;
  const color = urgent ? "#f87171" : "#a5b4fc";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}
        style={{ transform: "rotate(-90deg)", display: "block" }}>
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
        color, fontSize: 14, fontWeight: 800,
        transition: "color 0.3s ease",
      }}>
        {timeLeft}
      </span>
    </div>
  );
}

export function GameScreen({
  country,
  phase,
  lastScore,
  lastDistanceKm,
  showScorePop,
  totalScore,
  streak,
  autoAdvance,
  submitMapGuess,
  timeoutGuess,
  advance,
}) {
  const [view, setView] = useState("photo"); // "photo" | "map"
  const screenRef = useRef(null);
  const [screenHeight, setScreenHeight] = useState(800);

  // Photo countdown (10s → opens map automatically)
  const [photoTimeLeft, setPhotoTimeLeft] = useState(PHOTO_TIMER_SECONDS);

  // True only after the photo <img> fires onLoad — timer won't start before this
  const [photoReady, setPhotoReady] = useState(false);

  // Swipe-up drag feedback
  const [dragY, setDragY] = useState(0);

  // Animated total score display
  const [displayScore, setDisplayScore] = useState(totalScore);
  const prevScoreRef = useRef(totalScore);

  const isPlaying = phase === PHASE.PLAYING;
  const isRevealing = phase === PHASE.REVEALING;

  // Measure screen height for Y-axis layout
  useEffect(() => {
    const measure = () => {
      if (screenRef.current) setScreenHeight(screenRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Animate total score counter
  useEffect(() => {
    if (prevScoreRef.current === totalScore) return;
    const start = prevScoreRef.current;
    const end = totalScore;
    prevScoreRef.current = totalScore;
    const duration = 1000;
    const startTime = performance.now();
    let raf;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalScore]);

  // Reset when a new country loads — all in one render-body batch so effects
  // never see stale state from the previous round.
  const prevCountryId = useRef(country?.id);
  if (country?.id !== prevCountryId.current) {
    prevCountryId.current = country?.id;
    if (view !== "photo") setView("photo");
    if (dragY !== 0) setDragY(0);
    if (photoTimeLeft !== PHOTO_TIMER_SECONDS) setPhotoTimeLeft(PHOTO_TIMER_SECONDS);
    if (photoReady) setPhotoReady(false);
  }

  // Timer only starts once the photo image has actually loaded
  useEffect(() => {
    if (!isPlaying || view !== "photo" || !photoReady) return;
    const tid = setInterval(() => {
      setPhotoTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(tid);
  }, [isPlaying, view, country?.id, photoReady]);

  // Auto-open map when photo timer hits 0 (photoReady guard prevents false triggers)
  useEffect(() => {
    if (isPlaying && view === "photo" && photoReady && photoTimeLeft === 0) {
      setView("map");
    }
  }, [photoTimeLeft, isPlaying, view, photoReady]);

  // Auto-advance after reveal
  useEffect(() => {
    if (!isRevealing || !autoAdvance) return;
    const t = setTimeout(advance, AUTO_ADVANCE_DELAY);
    return () => clearTimeout(t);
  }, [isRevealing, autoAdvance, advance]);

  const openMap = useCallback(() => {
    if (isPlaying) {
      setView("map");
      setDragY(0);
    }
  }, [isPlaying]);

  const closeMap = useCallback(() => {
    setView("photo");
    setDragY(0);
  }, []);

  // ── Gesture handlers ──
  // Swipe UP = advance to next country:
  //   - from photo view (skip current, silent advance)
  //   - from revealing phase (go to next round)
  const handleSwipeUp = useCallback(() => {
    setDragY(0);
    if (isPlaying && view === "photo") advance();
    if (isRevealing) advance();
  }, [isPlaying, isRevealing, view, advance]);

  const handleDragY = useCallback((dy) => {
    // Only during photo view while playing — feedback for "swipe up to skip"
    if (isPlaying && view === "photo") setDragY(Math.min(0, dy));
  }, [isPlaying, view]);

  const handleDragEnd = useCallback(() => setDragY(0), []);

  // Enable swipe UP in photo view (playing) and during reveal
  const swipeEnabled = (isPlaying && view === "photo") || isRevealing;
  const swipeHandlers = useSwipe(
    swipeEnabled
      ? {
          onSwipeUp: handleSwipeUp,
          onDragY: handleDragY,
          onDragEnd: handleDragEnd,
          enabled: true,
        }
      : { enabled: false }
  );

  // ── Layout calculations (Y-axis: photo on top, map below) ──
  const h = screenHeight;
  const isDraggingUp = dragY < -2;

  const photoY = view === "map" ? -h : (isDraggingUp ? dragY * 0.35 : 0);
  const mapY   = view === "map" ? 0 : h;
  const useTransition = !isDraggingUp;
  const transitionStyle = useTransition
    ? "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)"
    : "none";
  const photoOpacity = isDraggingUp ? Math.max(0.45, 1 + dragY / 350) : 1;

  return (
    <div className={styles.screen} ref={screenRef} {...swipeHandlers}>

      {/* ── Photo view ── */}
      <div
        className={styles.photoView}
        style={{
          transform: `translateY(${photoY}px)`,
          transition: transitionStyle,
          opacity: photoOpacity,
        }}
      >
        {/* Fullscreen photo */}
        <div className={styles.slideStack}>
          <ReelSlide clue={country.clues[0]} onPhotoReady={() => setPhotoReady(true)} />
        </div>

        {/* HUD */}
        <div className={styles.hud}>
          <div className={styles.hudRow}>
            {/* Photo countdown ring — only shown after image loads */}
            {isPlaying && photoReady && (
              <CountdownRing timeLeft={photoTimeLeft} />
            )}
            <div className={styles.hudRight}>
              {streak >= 2 && (
                <span key={streak} className={styles.streakBadge}>
                  <span className={styles.streakIcon}>🔥</span>{streak}
                </span>
              )}
              <span className={styles.scoreBadge}>
                {displayScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* "Guess now" CTA — open map early */}
        {isPlaying && (
          <button className={styles.guessNowBtn} onClick={openMap}>
            Guess on map →
          </button>
        )}

        {/* Swipe-up drag hint */}
        {isDraggingUp && isPlaying && (
          <div className={styles.swipeUpHint}>↑ Release to skip</div>
        )}

        {/* Skip button (bottom-left) */}
        {isPlaying && (
          <button className={styles.skipBtn} onClick={advance}>Skip</button>
        )}
      </div>

      {/* ── Map view (below photo, slides up) ── */}
      <div
        className={styles.mapView}
        style={{
          transform: `translateY(${mapY}px)`,
          transition: transitionStyle,
          visibility: view === "map" ? "visible" : "hidden",
        }}
      >
        <MapScreen
          key={country.id}
          country={country}
          maxScore={1000}
          onScore={submitMapGuess}
          onBack={closeMap}
          onTimeout={timeoutGuess}
          visible={view === "map"}
        />

        {/* Score badge over map */}
        <div className={styles.mapScoreBadge}>
          {streak >= 2 && (
            <span key={streak} className={styles.streakBadge}>
              <span className={styles.streakIcon}>🔥</span>{streak}
            </span>
          )}
          <span className={styles.scoreBadge}>
            {displayScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Score pop */}
      {showScorePop && lastScore != null && (
        <ScorePop score={lastScore} onDone={() => {}} />
      )}

      {/* Post-round overlays */}
      {isRevealing && (
        <BriefReveal
          country={country}
          distanceKm={lastDistanceKm}
          score={lastScore}
          onTap={!autoAdvance ? advance : undefined}
        />
      )}
      {phase === PHASE.MILESTONE && (
        <MilestoneBurst streak={streak} totalScore={totalScore} onContinue={advance} />
      )}
      {phase === PHASE.SKIPPED && (
        <GaveUpOverlay country={country} onNext={advance} />
      )}
    </div>
  );
}
