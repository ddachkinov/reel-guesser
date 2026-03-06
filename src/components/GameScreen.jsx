import { useState, useEffect, useCallback, useRef } from "react";
import { ReelSlide } from "./ReelSlide";
import { MapScreen } from "./MapScreen";
import { ScorePop } from "./ScorePop";
import { BriefReveal } from "./BriefReveal";
import { MilestoneBurst } from "./MilestoneBurst";
import { GaveUpOverlay } from "./GaveUpOverlay";
import { useSwipe } from "../hooks/useSwipe";
import { PHASE, calcMaxScore } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

const AUTO_ADVANCE_DELAY = 2400;

export function GameScreen({
  country,
  phase,
  clueIndex,
  cluesViewed,
  lastScore,
  lastDistanceKm,
  showScorePop,
  totalScore,
  streak,
  autoAdvance,
  cycleClue,
  submitMapGuess,
  skipCountry,
  advance,
}) {
  const [view, setView] = useState("clue"); // "clue" | "map"
  const screenRef = useRef(null);
  const [screenHeight, setScreenHeight] = useState(800);

  // Continuous drag offsets
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);

  // Slide transition state — triggered from event handlers
  const [slideTransition, setSlideTransition] = useState({
    prevIdx: 0, dir: "left", active: false,
  });
  const transitionTimer = useRef(null);

  // Tap flash
  const [tapFlash, setTapFlash] = useState(null);

  // Animated score display
  const [displayScore, setDisplayScore] = useState(totalScore);
  const prevScoreRef = useRef(totalScore);

  const isPlaying = phase === PHASE.PLAYING;
  const maxScore = calcMaxScore(cluesViewed);

  // Measure screen height
  useEffect(() => {
    const measure = () => {
      if (screenRef.current) setScreenHeight(screenRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Animate score counter (count-up effect)
  useEffect(() => {
    if (prevScoreRef.current === totalScore) return;
    const start = prevScoreRef.current;
    const end = totalScore;
    prevScoreRef.current = totalScore;
    const duration = 600;
    const startTime = performance.now();
    let raf;
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalScore]);

  // Reset when a new country loads — this is a sync from props, acceptable
  const prevCountryId = useRef(country?.id);
  if (country?.id !== prevCountryId.current) {
    prevCountryId.current = country?.id;
    // These are safe: we're setting initial state before first render of new country
    if (view !== "clue") setView("clue");
    if (slideTransition.active || slideTransition.prevIdx !== 0) {
      setSlideTransition({ prevIdx: 0, dir: "left", active: false });
    }
    if (dragY !== 0) setDragY(0);
    if (dragX !== 0) setDragX(0);
  }

  // Auto-advance after reveal
  useEffect(() => {
    if (phase !== PHASE.REVEALING || !autoAdvance) return;
    const t = setTimeout(advance, AUTO_ADVANCE_DELAY);
    return () => clearTimeout(t);
  }, [phase, autoAdvance, advance]);

  const openMap = useCallback(() => {
    if (isPlaying) {
      setView("map");
      setDragY(0);
    }
  }, [isPlaying]);

  const closeMap = useCallback(() => {
    setView("clue");
    setDragY(0);
  }, []);

  // Start a slide transition — called from event handlers
  const startSlideTransition = useCallback((prevIdx, direction) => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    const dir = direction === "next" ? "left" : "right";
    setSlideTransition({ prevIdx, dir, active: true });
    transitionTimer.current = setTimeout(() => {
      setSlideTransition((prev) => ({ ...prev, active: false, prevIdx: prev.prevIdx }));
    }, 320);
  }, []);

  // Wrap cycleClue to trigger transitions from event handlers
  const handleCycleClue = useCallback((direction) => {
    const currentIdx = clueIndex;
    cycleClue(direction);
    startSlideTransition(currentIdx, direction);
  }, [clueIndex, cycleClue, startSlideTransition]);

  // ── Gesture handlers ──
  const handleDragY = useCallback((dy) => {
    if (view === "clue" && isPlaying) {
      setDragY(Math.min(0, dy));
    }
  }, [view, isPlaying]);

  const handleDragX = useCallback((dx) => {
    if (view === "clue" && isPlaying) {
      setDragX(dx);
    }
  }, [view, isPlaying]);

  const handleDragEnd = useCallback(() => {
    setDragY(0);
    setDragX(0);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (view === "clue" && isPlaying) {
      setDragX(0);
      handleCycleClue("next");
    }
  }, [view, isPlaying, handleCycleClue]);

  const handleSwipeRight = useCallback(() => {
    if (view === "clue" && isPlaying) {
      setDragX(0);
      handleCycleClue("prev");
    }
  }, [view, isPlaying, handleCycleClue]);

  const handleSwipeUp = useCallback(() => {
    setDragY(0);
    openMap();
  }, [openMap]);

  const swipeHandlers = useSwipe(
    view === "clue" && isPlaying
      ? {
          onSwipeLeft: handleSwipeLeft,
          onSwipeRight: handleSwipeRight,
          onSwipeUp: handleSwipeUp,
          onDragX: handleDragX,
          onDragY: handleDragY,
          onDragEnd: handleDragEnd,
          enabled: true,
        }
      : { enabled: false }
  );

  // ── Tap flash ──
  const handleTap = useCallback((e, direction) => {
    if (!isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTapFlash({ x, y, id: Date.now() });
    setTimeout(() => setTapFlash(null), 500);
    handleCycleClue(direction);
  }, [isPlaying, handleCycleClue]);

  // ── Layout calculations ──
  const h = screenHeight;
  const isDraggingY = dragY < -2;
  const isDraggingX = Math.abs(dragX) > 2;

  const clueY = view === "map" ? -h : dragY;
  const mapY = view === "map" ? 0 : h + dragY;
  const useTransition = !isDraggingY;
  const transitionStyle = useTransition
    ? "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)"
    : "none";

  const xTransition = !isDraggingX
    ? "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.32s ease"
    : "none";

  function renderClue(idx, entering, exiting) {
    const animClass = exiting
      ? (slideTransition.dir === "left" ? styles.exitLeft : styles.exitRight)
      : entering
      ? (slideTransition.dir === "left" ? styles.enterRight : styles.enterLeft)
      : styles.visible;

    return (
      <div key={idx} className={`${styles.slide} ${animClass}`}>
        <ReelSlide clue={country.clues[idx]} />
      </div>
    );
  }

  const totalClues = country?.clues.length ?? 0;

  return (
    <div className={styles.screen} ref={screenRef} {...swipeHandlers}>

      {/* ── Clue view ── */}
      <div
        className={styles.clueView}
        style={{ transform: `translateY(${clueY}px)`, transition: transitionStyle }}
      >
        {/* Slide stack with horizontal drag offset */}
        <div
          className={styles.slideStack}
          style={{
            transform: !slideTransition.active && isDraggingX
              ? `translateX(${dragX}px) scale(${1 - Math.abs(dragX) / (h * 2)})`
              : "translateX(0) scale(1)",
            transition: xTransition,
            opacity: !slideTransition.active && isDraggingX
              ? Math.max(0.5, 1 - Math.abs(dragX) / (h * 0.8))
              : 1,
            borderRadius: !slideTransition.active && isDraggingX
              ? `${Math.min(24, Math.abs(dragX) / 8)}px`
              : "0px",
            overflow: "hidden",
          }}
        >
          {slideTransition.active && renderClue(slideTransition.prevIdx, false, true)}
          {renderClue(clueIndex, slideTransition.active, false)}
        </div>

        {/* Tap zones */}
        {isPlaying && (
          <div className={styles.tapZones}>
            <div className={styles.tapLeft} onClick={(e) => handleTap(e, "prev")} />
            <div className={styles.tapRight} onClick={(e) => handleTap(e, "next")} />
          </div>
        )}

        {/* Tap flash ripple */}
        {tapFlash && (
          <div
            key={tapFlash.id}
            className={styles.tapRipple}
            style={{ left: tapFlash.x, top: tapFlash.y }}
          />
        )}

        {/* ── HUD ── */}
        <div className={styles.hud}>
          {/* Stories-style progress bars */}
          <div className={styles.progressBars}>
            {Array.from({ length: totalClues }).map((_, i) => (
              <div key={i} className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${
                    i < clueIndex ? styles.progressDone
                    : i === clueIndex ? styles.progressActive
                    : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <div className={styles.hudRow}>
            <div className={styles.hudLeft}>
              <span className={styles.clueLabel}>
                Clue {clueIndex + 1} of {totalClues}
              </span>
            </div>
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

        {/* Max score indicator */}
        {isPlaying && (
          <div className={styles.maxScoreBar}>
            <span className={styles.maxLabel}>Max</span>
            <span className={styles.maxValue}>{maxScore}</span>
            <span className={styles.maxPts}>pts</span>
          </div>
        )}

        {/* Swipe-up guess hint */}
        {isPlaying && (
          <button className={styles.guessHint} onClick={openMap}>
            <span className={styles.hintChevron}>
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                <path d="M1 8L7 2L13 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>Guess on map</span>
          </button>
        )}

        {/* Skip */}
        {isPlaying && (
          <button className={styles.skipBtn} onClick={skipCountry}>Skip</button>
        )}
      </div>

      {/* ── Map view ── */}
      <div
        className={styles.mapView}
        style={{
          transform: `translateY(${mapY}px)`,
          transition: transitionStyle,
          visibility: (view === "map" || isDraggingY) ? "visible" : "hidden",
        }}
      >
        <MapScreen
          key={country.id}
          country={country}
          maxScore={maxScore}
          onScore={submitMapGuess}
          onBack={closeMap}
        />

        {/* HUD over map */}
        <div className={styles.hud}>
          <div className={styles.progressBars} style={{ opacity: 0 }} />
          <div className={styles.hudRow}>
            <div className={styles.hudLeft} />
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
      </div>

      {/* Score pop */}
      {showScorePop && lastScore != null && (
        <ScorePop score={lastScore} onDone={() => {}} />
      )}

      {/* Post-round overlays */}
      {phase === PHASE.REVEALING && (
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
