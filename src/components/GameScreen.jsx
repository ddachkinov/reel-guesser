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
  const [screenWidth, setScreenWidth] = useState(400);

  // Continuous drag offsets
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);

  // Hint system
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [activeHint, setActiveHint] = useState(null); // clue object or null

  // Animated score display
  const [displayScore, setDisplayScore] = useState(totalScore);
  const prevScoreRef = useRef(totalScore);

  const isPlaying = phase === PHASE.PLAYING;
  const maxScore = calcMaxScore(cluesViewed);
  const maxHints = Math.max(0, (country?.clues.length ?? 1) - 1);

  // Measure screen dimensions
  useEffect(() => {
    const measure = () => {
      if (screenRef.current) {
        setScreenHeight(screenRef.current.offsetHeight);
        setScreenWidth(screenRef.current.offsetWidth);
      }
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
    const duration = 1000;
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

  // Reset when a new country loads
  const prevCountryId = useRef(country?.id);
  if (country?.id !== prevCountryId.current) {
    prevCountryId.current = country?.id;
    if (view !== "clue") setView("clue");
    if (dragY !== 0) setDragY(0);
    if (dragX !== 0) setDragX(0);
    if (hintsRevealed !== 0) setHintsRevealed(0);
    if (activeHint !== null) setActiveHint(null);
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
      setDragX(0);
      setActiveHint(null);
    }
  }, [isPlaying]);

  const closeMap = useCallback(() => {
    setView("clue");
    setDragX(0);
  }, []);

  // Reveal next hint as overlay bubble
  const revealHint = useCallback(() => {
    if (!isPlaying || hintsRevealed >= maxHints) return;
    const nextHintClueIdx = hintsRevealed + 1;
    const hintClue = country?.clues[nextHintClueIdx];
    if (!hintClue) return;
    cycleClue("next"); // penalise score for viewing more clues
    setHintsRevealed((h) => h + 1);
    setActiveHint(hintClue);
  }, [isPlaying, hintsRevealed, maxHints, country, cycleClue]);

  const dismissHint = useCallback(() => setActiveHint(null), []);

  // ── Gesture handlers ──
  // Drag LEFT (negative dragX in clue view) → peek at map
  // Drag UP   (negative dragY in clue view) → skip preview
  // In map view: no drag offset — Leaflet handles touch, we only commit on swipe
  const handleDragX = useCallback((dx) => {
    if (view === "clue" && isPlaying) setDragX(Math.min(0, dx));
  }, [view, isPlaying]);

  const handleDragY = useCallback((dy) => {
    if (view === "clue" && isPlaying) setDragY(Math.min(0, dy));
  }, [view, isPlaying]);

  const handleDragEnd = useCallback(() => {
    setDragY(0);
    setDragX(0);
  }, []);

  // Swipe LEFT (in clue view) → open map
  const handleSwipeLeft = useCallback(() => {
    setDragX(0);
    if (view === "clue") openMap();
  }, [view, openMap]);

  // Swipe RIGHT (in map view) → close map
  const handleSwipeRight = useCallback(() => {
    setDragX(0);
    if (view === "map") closeMap();
  }, [view, closeMap]);

  // Swipe UP → silently advance to next country (no reveal, no streak reset)
  const handleSwipeUp = useCallback(() => {
    setDragY(0);
    if (view === "clue" && isPlaying) advance();
  }, [view, isPlaying, advance]);

  // In map view: only handle right-swipe (close map) so Leaflet panning isn't blocked.
  // In clue view: handle left (open map), up (skip), and drag feedback.
  const swipeHandlers = useSwipe(
    isPlaying && view === "clue"
      ? {
          onSwipeLeft: handleSwipeLeft,
          onSwipeRight: undefined,
          onSwipeUp: handleSwipeUp,
          onDragX: handleDragX,
          onDragY: handleDragY,
          onDragEnd: handleDragEnd,
          enabled: true,
        }
      : isPlaying && view === "map"
      ? {
          onSwipeRight: handleSwipeRight,
          onDragEnd: handleDragEnd,
          enabled: true,
          commitDistance: 130,  // 2× default — intentional swipe needed to close map
          flickMinPx: 50,       // larger flick distance required too
        }
      : { enabled: false }
  );

  // ── Layout calculations ──
  // Map sits to the RIGHT. Left swipe slides clue left, map peeks in from right.
  const w = screenWidth;
  const isDraggingLeft = dragX < -2 && view === "clue";
  const isDraggingRight = dragX > 2 && view === "map";
  const isDraggingUp = dragY < -2 && view === "clue";

  const useXTransition = !isDraggingLeft && !isDraggingRight;
  const useYTransition = !isDraggingUp;
  const xTransitionStyle = useXTransition
    ? "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)"
    : "none";
  const yTransitionStyle = useYTransition
    ? "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)"
    : "none";

  // Clue view: sits at 0 normally; slides left to open map; slides up on skip drag
  // When in map view and dragging right, clue slides in from the left behind the map
  const clueTranslateX = view === "map"
    ? -w + Math.max(0, dragX)
    : (isDraggingLeft ? dragX : 0);
  const clueTranslateY = isDraggingUp ? dragY * 0.4 : 0;
  const clueOpacity = isDraggingUp ? Math.max(0.4, 1 + dragY / 300) : 1;

  // Map view: sits at +w normally; slides in from right when opening
  const mapTranslateX = view === "map" ? (isDraggingRight ? dragX : 0) : w + dragX;

  return (
    <div className={styles.screen} ref={screenRef} {...swipeHandlers}>

      {/* ── Clue view ── */}
      <div
        className={styles.clueView}
        style={{
          transform: `translateX(${clueTranslateX}px) translateY(${clueTranslateY}px)`,
          transition: useXTransition && !isDraggingUp
            ? "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)"
            : isDraggingUp ? "none" : xTransitionStyle,
          opacity: clueOpacity,
        }}
      >
        {/* Always show the base photo clue (index 0) */}
        <div className={styles.slideStack}>
          <div className={styles.slide}>
            <ReelSlide clue={country.clues[0]} />
          </div>
        </div>

        {/* ── HUD ── */}
        <div className={styles.hud}>
          <div className={styles.hudRow}>
            <div className={styles.hudLeft}>
              {/* Hint button */}
              {isPlaying && maxHints > 0 && (
                <button
                  className={`${styles.hintBtn} ${hintsRevealed >= maxHints ? styles.hintBtnExhausted : ""}`}
                  onClick={hintsRevealed < maxHints ? revealHint : undefined}
                  disabled={hintsRevealed >= maxHints}
                >
                  💡
                  <span className={styles.hintCount}>
                    {maxHints - hintsRevealed} hint{maxHints - hintsRevealed !== 1 ? "s" : ""}
                  </span>
                </button>
              )}
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

        {/* Hint overlay bubble */}
        {activeHint && (
          <div className={styles.hintOverlay} onClick={dismissHint}>
            <div className={styles.hintBubble}>
              <HintContent clue={activeHint} />
              <span className={styles.hintDismiss}>Tap to dismiss</span>
            </div>
          </div>
        )}

        {/* Swipe-left guess hint */}
        {isPlaying && !activeHint && (
          <button className={styles.guessHint} onClick={openMap}>
            <span className={styles.hintChevron}>
              <svg width="9" height="14" viewBox="0 0 9 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>Guess on map</span>
          </button>
        )}

        {/* Skip up-drag hint */}
        {isDraggingUp && isPlaying && (
          <div className={styles.skipDragHint}>
            <span>↑ Release to skip</span>
          </div>
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
          transform: `translateX(${mapTranslateX}px)`,
          transition: xTransitionStyle,
          visibility: (view === "map" || isDraggingLeft) ? "visible" : "hidden",
        }}
      >
        <MapScreen
          key={country.id}
          country={country}
          maxScore={maxScore}
          onScore={submitMapGuess}
          onBack={closeMap}
          visible={view === "map"}
        />

        {/* HUD over map */}
        <div className={styles.hud}>
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

// Renders a hint clue as compact overlay content
function HintContent({ clue }) {
  if (clue.type === "photo") {
    return <span className={styles.hintText}>{clue.caption || "Photo"}</span>;
  }
  if (clue.type === "fact") {
    return (
      <div className={styles.hintFactRow}>
        {clue.icon && <span className={styles.hintIcon}>{clue.icon}</span>}
        <span className={styles.hintText}>{clue.text}</span>
      </div>
    );
  }
  if (clue.type === "flag") {
    return (
      <div className={styles.hintFlagRow}>
        {(clue.colors || []).map((c, i) => (
          <span key={i} className={styles.hintFlagSwatch} style={{ background: c }} />
        ))}
        <span className={styles.hintText}>Flag colours</span>
      </div>
    );
  }
  if (clue.type === "stat") {
    return (
      <div className={styles.hintStats}>
        {(clue.stats || []).map((s, i) => (
          <div key={i} className={styles.hintStat}>
            <span className={styles.hintStatVal}>{s.value}</span>
            <span className={styles.hintStatLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className={styles.hintText}>{clue.text || "Hint"}</span>;
}
