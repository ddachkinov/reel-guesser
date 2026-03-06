import { useState, useEffect, useCallback } from "react";
import { ReelSlide } from "./ReelSlide";
import { MapSheet } from "./MapSheet";
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
  const [mapOpen, setMapOpen] = useState(false);
  const [prevClueIndex, setPrevClueIndex] = useState(clueIndex);
  const [slideDir, setSlideDir] = useState("left");
  const [transitioning, setTransitioning] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const isPlaying = phase === PHASE.PLAYING;
  const isOver = phase === PHASE.REVEALING || phase === PHASE.SKIPPED || phase === PHASE.MILESTONE;
  const maxScore = calcMaxScore(cluesViewed);

  // Horizontal slide transition when clue changes
  useEffect(() => {
    if (clueIndex !== prevClueIndex) {
      setSlideDir(
        // Determine direction based on cycling forward or back
        // Since clues wrap, check the "short path"
        clueIndex !== (prevClueIndex + 1) % (country?.clues.length ?? 1) ? "right" : "left"
      );
      setTransitioning(true);
      const t = setTimeout(() => {
        setPrevClueIndex(clueIndex);
        setTransitioning(false);
      }, 340);
      return () => clearTimeout(t);
    }
  }, [clueIndex, prevClueIndex, country]);

  // Auto-advance after reveal
  useEffect(() => {
    if (phase === PHASE.REVEALING) {
      setMapOpen(false);
      if (autoAdvance) {
        const t = setTimeout(advance, AUTO_ADVANCE_DELAY);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setBouncing(true), 700);
      return () => clearTimeout(t);
    }
    setBouncing(false);
  }, [phase, autoAdvance, advance]);

  // Close map when a new country loads
  useEffect(() => {
    setMapOpen(false);
    setPrevClueIndex(0);
    setTransitioning(false);
    setBouncing(false);
  }, [country?.id]);

  const openMap = useCallback(() => {
    if (isPlaying) setMapOpen(true);
  }, [isPlaying]);

  const closeMap = useCallback(() => setMapOpen(false), []);

  const swipeHandlers = useSwipe(
    !mapOpen && isPlaying
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

      {/* Clue slides — always behind everything else */}
      <div className={styles.slideStack}>
        {transitioning && renderClue(prevClueIndex, false, true)}
        {renderClue(clueIndex, transitioning, false)}
      </div>

      {/* Tap zones for cycling clues (only when map is closed and playing) */}
      {isPlaying && !mapOpen && (
        <div className={styles.tapZones}>
          <div className={styles.tapLeft} onClick={() => cycleClue("prev")} />
          <div className={styles.tapRight} onClick={() => cycleClue("next")} />
        </div>
      )}

      {/* Top HUD — progress dots, score, streak */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          {/* Clue indicator dots */}
          <div className={styles.clueDots}>
            {country.clues.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === clueIndex ? styles.dotActive : i < cluesViewed ? styles.dotSeen : ""}`}
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

      {/* Max score indicator — shows penalty for viewing more clues */}
      {isPlaying && !mapOpen && (
        <div className={styles.maxScoreBar}>
          <span className={styles.maxScoreLabel}>Max score</span>
          <span className={styles.maxScoreValue}>{maxScore} pts</span>
          {cluesViewed > 1 && (
            <span className={styles.penaltyNote}>
              ({cluesViewed - 1} clue{cluesViewed > 2 ? "s" : ""} peeked)
            </span>
          )}
        </div>
      )}

      {/* Swipe-up hint */}
      {isPlaying && !mapOpen && (
        <button className={styles.guessHint} onClick={openMap}>
          <span className={styles.guessArrow}>↑</span>
          Swipe up to guess on map
        </button>
      )}

      {/* Skip button */}
      {isPlaying && !mapOpen && (
        <button className={styles.skipBtn} onClick={skipCountry}>Skip</button>
      )}

      {/* Map sheet — slides up from bottom */}
      <MapSheet
        country={country}
        maxScore={maxScore}
        open={mapOpen && isPlaying}
        onScore={submitMapGuess}
        onDismiss={closeMap}
      />

      {/* Score pop */}
      {showScorePop && lastScore != null && (
        <ScorePop score={lastScore} onDone={() => {}} />
      )}

      {/* Bounce hint for manual-advance mode */}
      {bouncing && (
        <div className={styles.bounceHint} onClick={advance}>
          <span>↑</span>
          <span>Swipe for next country</span>
        </div>
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
