import { useRef, useEffect } from "react";
import { COUNTRIES } from "../data/countries";
import styles from "./GuessInput.module.css";

export function GuessInput({ guess, setGuess, onSubmit, onGiveUp, wrongGuesses, canRevealMore, onRevealNext, currentClueIndex, maxClues }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKey(e) {
    if (e.key === "Enter") onSubmit();
  }

  // Filter country suggestions
  const suggestions = guess.length >= 2
    ? COUNTRIES.filter((c) =>
        c.answer.toLowerCase().startsWith(guess.toLowerCase()) &&
        c.answer.toLowerCase() !== guess.toLowerCase()
      ).slice(0, 4)
    : [];

  return (
    <div className={styles.container}>
      {wrongGuesses.length > 0 && (
        <div className={styles.wrongGuesses}>
          {wrongGuesses.map((w) => (
            <span key={w} className={styles.wrongTag}>✗ {w}</span>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Name the country..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKey}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className={styles.submitBtn} onClick={onSubmit} disabled={!guess.trim()}>
          Guess
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              className={styles.suggestion}
              onClick={() => {
                setGuess(s.answer);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              {s.emoji} {s.answer}
            </button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {canRevealMore && (
          <button className={styles.hintBtn} onClick={onRevealNext}>
            <span>Next clue</span>
            <span className={styles.clueCounter}>({currentClueIndex + 1}/{maxClues})</span>
          </button>
        )}
        <button className={styles.giveUpBtn} onClick={onGiveUp}>
          Give up
        </button>
      </div>
    </div>
  );
}
