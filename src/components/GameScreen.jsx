import { useState, useEffect, useCallback } from "react";
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
  // "clue" view or "map" view — treated as two reel positions (up/down)
  const [view, setView] = useState("clue"); // "clue" | "map"

  // Horizontal clue slide transition
  const [prevClueIndex, setPrevClueIndex] = useState(clueIndex);
  const [slideDir, setSlideDir] = useState("left");
  const [transitioning, setTransitioning] = useState(false);

  const isPlaying = phase === PHASE.PLAYING;
  const maxScore = calcMaxScore(cluesViewed);

  // Horizontal slide animation when cycling clues
  useEffect(() => {
    if (clueIndex === prevClueIndex) return;
    const len = country?.clues.length ?? 1;
    const goingForward = clueIndex === (prevClueIndex + 1) % len;
    setSlideDir(goingForward ? "left" : "right");
    setTransitioning(true);
    const t = setTimeout(() => {
      setPrevClueIndex(clueIndex);
      setTransitioning(false);
    }, 340);
    return () => clearTimeout(t);
  }, [clueIndex, prevClueIndex, country]);

  // Reset view to clue when a new country loads
  useEffect(() => {
    setView("clue");
    setPrevClueIndex(0);
    setTransitioning(false);
  }, [country?.id]);

  // Auto-advance after reveal
  useEffect(() => {
    if (phase !== PHASE.REVEALING) return;
    if (autoAdvance) {
      const t = setTimeout(advance, AUTO_ADVANCE_DELAY);
      return () => clearTimeout(t);
    }
  }, [phase, autoAdvance, advance]);

  const openMap = useCallback(() => {
    if (isPlaying) setView("map");
  }, [isPlaying]);

  const closeMap = useCallback(() => setView("clue"), []);

  // Swipe handlers — only when on clue view and playing
  const swipeHandlers = useSwipe(
    view === "clue" && isPlaying
      ? {
          onSwipeLeft: () => cycleClue("next"),
          onSwipeRight: () => cycleClue("prev"),
          onSwipeUp: openMap,
        }
      : {}
  );

  function renderClue(idx, entering, exiting) {
    const animClass = exiting
      ? (slideDir === "left" ? styles.exitLeft : styles.exitRight)
      : entering
      ? (slideDir === "left" ? styles.enterRight : styles.enterLeft)
      : styles.visible;

    return (
      <div key={idx} className={`${styles.slide} ${animClass}`}>
        <ReelSlide clue={country.clues[idx]} />
      </div>
    );
  }

  return (
    <div className={styles.screen} {...swipeHandlers}>

      {/* ── Clue view ── */}
      <div className={`${styles.clueView} ${view === "map" ? styles.clueExitUp : ""}`}>
        {/* Slide stack */}
        <div className={styles.slideStack}>
          {transitioning && renderClue(prevClueIndex, false, true)}
          {renderClue(clueIndex, transitioning, false)}
        </div>

        {/* Tap zones for cycling */}
        {isPlaying && (
          <div className={styles.tapZones}>
            <div className={styles.tapLeft} onClick={() => cycleClue("prev")} />
            <div className={styles.tapRight} onClick={() => cycleClue("next")} />
          </div>
        )}

        {/* HUD */}
        <div className={styles.hud}>
          <div className={styles.hudLeft}>
            <div className={styles.clueDots}>
              {country.clues.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot}
                    ${i === clueIndex ? styles.dotActive : ""}
                    ${i < cluesViewed && i !== clueIndex ? styles.dotSeen : ""}`}
                />
              ))}
            </div>
          </div>
          <div className={styles.hudRight}>
            {streak >= 2 && (
              <span key={streak} className={styles.streakBadge}>🔥 {streak}</span>
            )}
            <span className={styles.scoreBadge}>{totalScore.toLocaleString()}</span>
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

        {/* Swipe-up hint */}
        {isPlaying && (
          <button className={styles.guessHint} onClick={openMap}>
            <span className={styles.hintArrow}>↑</span>
            Swipe up to guess
          </button>
        )}

        {/* Skip */}
        {isPlaying && (
          <button className={styles.skipBtn} onClick={skipCountry}>Skip</button>
        )}
      </div>

      {/* ── Map view — full-screen, slides up like a reel ── */}
      <div className={`${styles.mapView} ${view === "map" ? styles.mapOpen : ""}`}>
        {/* Re-key on country ID so Leaflet always starts fresh */}
        <MapScreen
          key={country.id}
          country={country}
          maxScore={maxScore}
          onScore={submitMapGuess}
          onBack={closeMap}
        />

        {/* HUD also visible over the map */}
        <div className={styles.hud}>
          <div className={styles.hudLeft} />
          <div className={styles.hudRight}>
            {streak >= 2 && (
              <span key={streak} className={styles.streakBadge}>🔥 {streak}</span>
            )}
            <span className={styles.scoreBadge}>{totalScore.toLocaleString()}</span>
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
