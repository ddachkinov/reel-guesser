import { useState, useEffect, useCallback } from "react";
import { ReelSlide } from "./ReelSlide";
import { MapSlide } from "./MapSlide";
import { ScorePop } from "./ScorePop";
import { BriefReveal } from "./BriefReveal";
import { MilestoneBurst } from "./MilestoneBurst";
import { GaveUpOverlay } from "./GaveUpOverlay";
import { useSwipe } from "../hooks/useSwipe";
import { PHASE, FRAME, MAX_FRAMES } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

const AUTO_ADVANCE_DELAY = 2200;

export function GameScreen({
  country,
  phase,
  frameIndex,
  lastScore,
  lastDistanceKm,
  showScorePop,
  totalScore,
  streak,
  autoAdvance,
  nextFrame,
  prevFrame,
  submitMapGuess,
  skipCountry,
  advance,
}) {
  const [prevFrameIndex, setPrevFrameIndex] = useState(frameIndex);
  const [slideDir, setSlideDir] = useState("left");
  const [transitioning, setTransitioning] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const isPlaying = phase === PHASE.PLAYING;
  const isOnMap = frameIndex === FRAME.MAP;

  // Horizontal slide transition on frame change
  useEffect(() => {
    if (frameIndex !== prevFrameIndex) {
      setSlideDir(frameIndex > prevFrameIndex ? "left" : "right");
      setTransitioning(true);
      const t = setTimeout(() => {
        setPrevFrameIndex(frameIndex);
        setTransitioning(false);
      }, 360);
      return () => clearTimeout(t);
    }
  }, [frameIndex, prevFrameIndex]);

  // Auto-advance or bounce hint after reveal
  useEffect(() => {
    if (phase === PHASE.REVEALING) {
      if (autoAdvance) {
        const t = setTimeout(advance, AUTO_ADVANCE_DELAY);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setBouncing(true), 700);
      return () => clearTimeout(t);
    }
    setBouncing(false);
  }, [phase, autoAdvance, advance]);

  const goNext = useCallback(() => {
    if (isPlaying && frameIndex < MAX_FRAMES - 1) nextFrame();
  }, [isPlaying, frameIndex, nextFrame]);

  const goBack = useCallback(() => {
    if (isPlaying && frameIndex > 0) prevFrame();
  }, [isPlaying, frameIndex, prevFrame]);

  // Swipe gestures only active on non-map frames
  const swipeHandlers = useSwipe(
    !isOnMap && isPlaying
      ? { onSwipeLeft: goNext, onSwipeRight: goBack, onSwipeUp: skipCountry }
      : {}
  );

  function renderFrame(idx, entering, exiting) {
    const animClass = exiting
      ? (slideDir === "left" ? styles.exitLeft : styles.exitRight)
      : entering
      ? (slideDir === "left" ? styles.enterRight : styles.enterLeft)
      : styles.visible;

    if (idx === FRAME.MAP) {
      return (
        <div key="map" className={`${styles.slide} ${animClass}`}>
          <MapSlide
            country={country}
            onScore={(lat, lng) => {
              if (lat === null) { skipCountry(); return; }
              submitMapGuess(lat, lng);
            }}
            isActive={frameIndex === FRAME.MAP && !transitioning}
          />
        </div>
      );
    }

    return (
      <div key={idx} className={`${styles.slide} ${animClass}`}>
        <ReelSlide clue={country.clues[idx]} />
      </div>
    );
  }

  return (
    <div className={styles.screen} {...swipeHandlers}>

      {/* Story progress segments */}
      <div className={styles.progressBar}>
        {Array(MAX_FRAMES).fill(null).map((_, i) => {
          const filled = i <= frameIndex;
          const won = phase === PHASE.REVEALING || phase === PHASE.MILESTONE;
          const skipped = phase === PHASE.SKIPPED;
          return (
            <div key={i} className={styles.segment}>
              <div
                className={styles.segFill}
                style={{
                  width: filled ? "100%" : "0%",
                  background:
                    won && filled ? "rgba(52,211,153,0.9)" :
                    skipped && filled ? "rgba(239,68,68,0.5)" :
                    "rgba(255,255,255,0.9)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* HUD */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          {streak >= 2 && (
            <span key={streak} className={styles.streakBadge}>🔥 {streak}</span>
          )}
        </div>
        <div className={styles.hudRight}>
          <span className={styles.scoreBadge}>{totalScore.toLocaleString()}</span>
          {isPlaying && !isOnMap && (
            <button className={styles.skipHudBtn} onClick={skipCountry}>Skip</button>
          )}
        </div>
      </div>

      {/* Frame slides */}
      <div className={styles.slideStack}>
        {transitioning && renderFrame(prevFrameIndex, false, true)}
        {renderFrame(frameIndex, transitioning, false)}
      </div>

      {/* Tap zones (clue frames only) */}
      {isPlaying && !isOnMap && (
        <div className={styles.tapZones}>
          <div className={styles.tapLeft} onClick={goBack} />
          <div className={styles.tapRight} onClick={goNext} />
        </div>
      )}

      {/* Bottom frame hint */}
      {isPlaying && !isOnMap && (
        <div className={styles.frameHint}>
          {frameIndex < MAX_FRAMES - 1
            ? "swipe left for next clue →"
            : "← back to clues"}
        </div>
      )}

      {/* Score pop */}
      {showScorePop && lastScore != null && (
        <ScorePop score={lastScore} onDone={() => {}} />
      )}

      {/* Bounce hint for manual-advance mode */}
      {bouncing && (
        <div className={styles.bounceHint} onClick={advance}>
          <span className={styles.bounceArrow}>↑</span>
          <span>Swipe or tap for next country</span>
        </div>
      )}

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
