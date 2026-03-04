import styles from "./ResultScreen.module.css";

export function ResultScreen({ country, score, cluesUsed, won, onNext, onShare, streak }) {
  const clueLabels = ["1st", "2nd", "3rd", "4th", "5th"];

  function getScoreMessage(s) {
    if (!won) return "Better luck next time!";
    if (s >= 900) return "Outstanding!";
    if (s >= 700) return "Excellent!";
    if (s >= 500) return "Well done!";
    if (s >= 300) return "Good try!";
    return "Keep playing!";
  }

  function buildShareText() {
    const blocks = Array(5).fill("⬛");
    for (let i = 0; i < cluesUsed; i++) blocks[i] = "🟨";
    if (won) blocks[cluesUsed - 1] = "🟩";
    return `🌍 ReelGuesser – ${country.answer}\n${blocks.join("")}\n${won ? `Score: ${score}` : "Better luck next time!"}\nPlay at reelguesser.app`;
  }

  function share() {
    const text = buildShareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {won ? (
          <>
            <div className={styles.winIcon}>🎉</div>
            <h2 className={styles.message}>{getScoreMessage(score)}</h2>
            <p className={styles.answer}>{country.emoji} {country.answer}</p>
          </>
        ) : (
          <>
            <div className={styles.winIcon}>😔</div>
            <h2 className={styles.message}>The answer was...</h2>
            <p className={styles.answer}>{country.emoji} {country.answer}</p>
          </>
        )}
      </div>

      {won && (
        <div className={styles.scoreCard}>
          <div className={styles.scoreMain}>
            <span className={styles.scoreNum}>+{score}</span>
            <span className={styles.scorePts}>pts</span>
          </div>
          <p className={styles.scoreDetail}>Guessed in {clueLabels[cluesUsed - 1]} clue{cluesUsed > 1 ? "s" : ""}</p>
        </div>
      )}

      <div className={styles.countryInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Capital</span>
          <span className={styles.infoValue}>{country.capital}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Region</span>
          <span className={styles.infoValue}>{country.region}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Population</span>
          <span className={styles.infoValue}>{country.population.toLocaleString()}</span>
        </div>
      </div>

      {streak > 1 && (
        <div className={styles.streakBanner}>
          🔥 {streak} day streak!
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.shareBtn} onClick={share}>
          Share result
        </button>
        <button className={styles.nextBtn} onClick={onNext}>
          Next country →
        </button>
      </div>
    </div>
  );
}
