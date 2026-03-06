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
          <p>Swipe left through photo and fact clues about a mystery country</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>2</span>
          <p>On the map slide, tap to place your pin as close as you can</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNum}>3</span>
          <p>Score is based on distance — the closer, the better</p>
        </div>
        <div className={styles.scoreGuide}>
          <div className={styles.scoreRow}><span>🎯 Under 500 km</span><span className={styles.pts}>~900 pts</span></div>
          <div className={styles.scoreRow}><span>🔥 Under 2 000 km</span><span className={styles.pts}>~600 pts</span></div>
          <div className={styles.scoreRow}><span>👍 Under 4 000 km</span><span className={styles.pts}>~200 pts</span></div>
          <div className={styles.scoreRow}><span>🌊 5 000+ km off</span><span className={styles.pts}>0 pts</span></div>
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
