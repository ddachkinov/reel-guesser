import styles from "./IntroScreen.module.css";

export function IntroScreen({ onStart, totalScore, gamesPlayed, streak, autoAdvance, onToggleAutoAdvance }) {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🌍</span>
        <h1 className={styles.title}>ReelGuesser</h1>
        <p className={styles.tagline}>Swipe. Guess. Learn.</p>
      </div>

      <div className={styles.howTo}>
        <h2 className={styles.howTitle}>How to play</h2>
        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <p>A photo appears — you have 10 s to study it before the map opens</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <p>Tap the map to pin your guess — 10 s on the clock, no pin = no points</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <p>Score by distance, learn a fact, swipe up for the next photo</p>
        </div>
      </div>

      {gamesPlayed > 0 && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{gamesPlayed}</span>
            <span className={styles.statLabel}>Played</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalScore.toLocaleString()}</span>
            <span className={styles.statLabel}>Total pts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{streak}</span>
            <span className={styles.statLabel}>🔥 Streak</span>
          </div>
        </div>
      )}

      {/* Auto-advance toggle */}
      <div className={styles.settingRow} onClick={onToggleAutoAdvance}>
        <div className={styles.settingText}>
          <span className={styles.settingLabel}>Auto-advance</span>
          <span className={styles.settingDesc}>
            {autoAdvance ? "Next country loads automatically" : "Swipe up after each round"}
          </span>
        </div>
        <div className={`${styles.toggle} ${autoAdvance ? styles.toggleOn : ""}`}>
          <div className={styles.toggleThumb} />
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.playBtn} onClick={onStart}>
          Play
        </button>
      </div>
    </div>
  );
}
