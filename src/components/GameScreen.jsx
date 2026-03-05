import { useState, useEffect } from "react";
import { ReelSlide } from "./ReelSlide";
import { AnswerButtons } from "./AnswerButtons";
import { ScorePop } from "./ScorePop";
import { BriefReveal } from "./BriefReveal";
import { MilestoneBurst } from "./MilestoneBurst";
import { GaveUpOverlay } from "./GaveUpOverlay";
import { useSwipe } from "../hooks/useSwipe";
import { PHASE } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

// Auto-advance delay after correct answer (ms)
const REVEAL_DURATION = 1800;

export function GameScreen({
  country,
  phase,
  currentClueIndex,
  choices,
  selectedChoice,
  wrongChoices,
  lastScore,
  showScorePop,
  totalScore,
  streak,
  maxClues,
  onSelectChoice,
  onRevealNext,
  onGiveUp,
  advanceAfterReveal,
  continueAfterBreak,
}) {
  const [prevClueIndex, setPrevClueIndex] = useState(currentClueIndex);
  const [transitioning, setTransitioning] = useState(false);

  // Slide transition on clue change
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

  // Auto-advance after brief reveal
  useEffect(() => {
    if (phase === PHASE.REVEALING) {
      const t = setTimeout(advanceAfterReveal, REVEAL_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase, advanceAfterReveal]);

  const isPlaying = phase === PHASE.PLAYING;
  const canGoNext = currentClueIndex < maxClues - 1 && isPlaying;

  const swipeHandlers = useSwipe({
    onSwipeUp: canGoNext ? onRevealNext : undefined,
  });

  const currentClue = country.clues[currentClueIndex];
  const prevClue = country.clues[prevClueIndex];

  return (
    <div className={styles.screen} {...swipeHandlers}>
      {/* Story progress bar */}
      <div className={styles.progressBar}>
        {Array(maxClues).fill(null).map((_, i) => (
          <div key={i} className={styles.progressSegment}>
            <div
              className={styles.progressFill}
              style={{
                width: i <= currentClueIndex ? "100%" : "0%",
                background:
                  phase === PHASE.REVEALING || phase === PHASE.MILESTONE
                    ? "rgba(52, 211, 153, 0.9)"
                    : phase === PHASE.GAVE_UP
                    ? "rgba(239, 68, 68, 0.6)"
                    : "rgba(255,255,255,0.9)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Top HUD */}
      <div className={styles.topOverlay}>
        <div className={styles.hudLeft}>
          <span className={styles.clueBadge}>Clue {currentClueIndex + 1}/{maxClues}</span>
          {streak >= 2 && (
            <span className={styles.streakBadge}>🔥 {streak}</span>
          )}
        </div>
        <div className={styles.hudRight}>
          <span className={styles.scoreBadge}>{totalScore.toLocaleString()}</span>
          {isPlaying && (
            <button className={styles.giveUpBtn} onClick={onGiveUp}>
              Give up
            </button>
          )}
        </div>
      </div>

      {/* Full-screen slide stack */}
      <div className={styles.slideStack}>
        {transitioning && prevClue && prevClue !== currentClue && (
          <ReelSlide clue={prevClue} isExiting direction="up" />
        )}
        <ReelSlide
          clue={currentClue}
          isEntering={transitioning}
          direction="up"
        />
      </div>

      {/* Score pop (floats up on correct) */}
      {showScorePop && lastScore && (
        <ScorePop score={lastScore} onDone={() => {}} />
      )}

      {/* Bottom answer area — only while actively playing */}
      {isPlaying && (
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
            revealed={false}
          />
        </div>
      )}

      {/* Brief country reveal (2s, auto-advances) */}
      {phase === PHASE.REVEALING && (
        <BriefReveal country={country} />
      )}

      {/* Milestone burst — tap to continue */}
      {phase === PHASE.MILESTONE && (
        <MilestoneBurst
          streak={streak}
          totalScore={totalScore}
          onContinue={continueAfterBreak}
        />
      )}

      {/* Gave up overlay — tap to continue */}
      {phase === PHASE.GAVE_UP && (
        <GaveUpOverlay country={country} onNext={continueAfterBreak} />
      )}
    </div>
  );
}
