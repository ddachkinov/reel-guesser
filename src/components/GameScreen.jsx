import { useState, useEffect, useRef } from "react";
import { ReelSlide } from "./ReelSlide";
import { AnswerButtons } from "./AnswerButtons";
import { ResultScreen } from "./ResultScreen";
import { useSwipe } from "../hooks/useSwipe";
import { PHASE } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

export function GameScreen({
  country,
  phase,
  currentClueIndex,
  choices,
  selectedChoice,
  wrongChoices,
  score,
  streak,
  maxClues,
  onSelectChoice,
  onRevealNext,
  onGiveUp,
  onNext,
}) {
  const [prevClueIndex, setPrevClueIndex] = useState(currentClueIndex);
  const [transitioning, setTransitioning] = useState(false);
  const isOver = phase === PHASE.CORRECT || phase === PHASE.GAVE_UP;

  // Detect clue index changes → trigger slide transition
  useEffect(() => {
    if (currentClueIndex !== prevClueIndex) {
      setTransitioning(true);
      const t = setTimeout(() => {
        setPrevClueIndex(currentClueIndex);
        setTransitioning(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentClueIndex, prevClueIndex]);

  const canGoNext = currentClueIndex < maxClues - 1 && !isOver;

  const swipeHandlers = useSwipe({
    onSwipeUp: canGoNext ? onRevealNext : undefined,
  });

  const currentClue = country.clues[currentClueIndex];
  const prevClue = country.clues[prevClueIndex];

  return (
    <div className={styles.screen} {...swipeHandlers}>
      {/* Instagram-style story progress bar */}
      <div className={styles.progressBar}>
        {Array(maxClues).fill(null).map((_, i) => (
          <div key={i} className={styles.progressSegment}>
            <div
              className={styles.progressFill}
              style={{
                width: i < currentClueIndex ? "100%"
                     : i === currentClueIndex ? "100%"
                     : "0%",
                background: isOver && phase === PHASE.CORRECT
                  ? "rgba(52, 211, 153, 0.9)"
                  : isOver
                  ? "rgba(239, 68, 68, 0.6)"
                  : "rgba(255,255,255,0.9)",
                transition: i === currentClueIndex && !isOver
                  ? "none"
                  : "width 0s",
              }}
            />
          </div>
        ))}
      </div>

      {/* Clue label top-left */}
      <div className={styles.topOverlay}>
        <span className={styles.clueBadge}>
          Clue {currentClueIndex + 1} of {maxClues}
        </span>
        <button className={styles.giveUpBtn} onClick={onGiveUp} disabled={isOver}>
          Give up
        </button>
      </div>

      {/* Full-screen slide stack */}
      <div className={styles.slideStack}>
        {/* Previous slide — exits upward */}
        {transitioning && prevClue && prevClue !== currentClue && (
          <ReelSlide clue={prevClue} isExiting direction="up" />
        )}
        {/* Current slide — enters from below */}
        <ReelSlide
          clue={currentClue}
          isEntering={transitioning}
          direction="up"
        />
      </div>

      {/* Bottom overlay — question + answers */}
      {!isOver && (
        <div className={styles.bottomOverlay}>
          <p className={styles.question}>Which country is this?</p>
          {canGoNext && (
            <button className={styles.swipeHint} onClick={onRevealNext}>
              ↑ Swipe for next clue
            </button>
          )}
          <AnswerButtons
            choices={choices}
            selectedChoice={selectedChoice}
            wrongChoices={wrongChoices}
            correctId={country.id}
            onSelect={onSelectChoice}
            revealed={phase === PHASE.CORRECT}
          />
        </div>
      )}

      {/* Result screen slides up after correct/give-up */}
      {isOver && (
        <div className={styles.resultOverlay}>
          <ResultScreen
            country={country}
            score={score}
            cluesUsed={currentClueIndex + 1}
            won={phase === PHASE.CORRECT}
            onNext={onNext}
            streak={streak}
          />
        </div>
      )}
    </div>
  );
}
