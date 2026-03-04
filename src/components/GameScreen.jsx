import { useRef, useEffect } from "react";
import { ClueCard } from "./ClueCard";
import { GuessInput } from "./GuessInput";
import { ResultScreen } from "./ResultScreen";
import { PHASE } from "../hooks/useGameState";
import styles from "./GameScreen.module.css";

export function GameScreen({
  country,
  phase,
  currentClueIndex,
  guess,
  setGuess,
  wrongGuesses,
  score,
  streak,
  maxClues,
  onSubmit,
  onGiveUp,
  onRevealNext,
  onNext,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when a new clue appears
  useEffect(() => {
    if (phase === PHASE.PLAYING) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [currentClueIndex, phase]);

  const visibleClues = country.clues.slice(0, currentClueIndex + 1);
  const canRevealMore = currentClueIndex < maxClues - 1;

  const won = phase === PHASE.CORRECT;
  const over = phase === PHASE.CORRECT || phase === PHASE.GAVE_UP;

  return (
    <div className={styles.screen}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logoText}>🌍 ReelGuesser</span>
        </div>
        <div className={styles.clueProgress}>
          {Array(maxClues).fill(null).map((_, i) => (
            <div
              key={i}
              className={`${styles.pip} ${
                i <= currentClueIndex ? styles.pipActive : ""
              } ${over && won ? styles.pipWon : ""} ${over && !won ? styles.pipLost : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Clue feed */}
      <div className={styles.feed} ref={scrollRef}>
        <div className={styles.question}>
          <h2 className={styles.questionText}>Which country is this?</h2>
          <p className={styles.questionSub}>Scroll through clues or guess right away</p>
        </div>

        <div className={styles.clues}>
          {visibleClues.map((clue, i) => (
            <ClueCard
              key={i}
              clue={clue}
              index={i}
              isLatest={i === currentClueIndex}
            />
          ))}
        </div>

        {/* Guess input or result */}
        <div className={styles.inputArea}>
          {!over ? (
            <GuessInput
              guess={guess}
              setGuess={setGuess}
              onSubmit={onSubmit}
              onGiveUp={onGiveUp}
              onRevealNext={onRevealNext}
              wrongGuesses={wrongGuesses}
              canRevealMore={canRevealMore}
              currentClueIndex={currentClueIndex}
              maxClues={maxClues}
            />
          ) : (
            <ResultScreen
              country={country}
              score={score}
              cluesUsed={currentClueIndex + 1}
              won={won}
              onNext={onNext}
              streak={streak}
            />
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
