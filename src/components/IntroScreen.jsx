import styles from "./IntroScreen.module.css";

export function IntroScreen({ onStart, totalScore, gamesPlayed, streak }) {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🌍</span>
        <h1 className={styles.title}>ReelGuesser</h1>
        <p className={styles.tagline}>Scroll. Guess. Learn.</p>
      </div>

      <div className={styles.howTo}>
        <h2 className={styles.howTitle}>How to play</h2>
        <div className={styles.step}>
          <span className={styles.stepNum}>1</span>
          <p>You'll be shown visual clues about a mystery country</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <p>Guess after each clue — fewer clues = more points</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <p>Scroll down for the next clue if you need more help</p>
        </div>
        <div className={styles.scoreGuide}>
          <div className={styles.scoreRow}><span>🥇 Guess in 1 clue</span><span className={styles.pts}>1000 pts</span></div>
          <div className={styles.scoreRow}><span>🥈 Guess in 2 clues</span><span className={styles.pts}>750 pts</span></div>
          <div className={styles.scoreRow}><span>🥉 Guess in 3 clues</span><span className={styles.pts}>500 pts</span></div>
          <div className={styles.scoreRow}><span>💡 Guess in 4–5 clues</span><span className={styles.pts}>150–300 pts</span></div>
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

      <div className={styles.buttons}>
        <button className={styles.dailyBtn} onClick={() => onStart("daily")}>
          Play today's country
        </button>
        <button className={styles.endlessBtn} onClick={() => onStart("endless")}>
          Endless mode
        </button>
      </div>
    </div>
  );
}
