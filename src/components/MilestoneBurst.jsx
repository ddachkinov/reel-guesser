import styles from "./MilestoneBurst.module.css";

const MILESTONE_COPY = {
  3:  { headline: "On fire!",        sub: "3 in a row",   icon: "🔥" },
  5:  { headline: "Unstoppable",     sub: "5 in a row",   icon: "⚡" },
  10: { headline: "Geography god",   sub: "10 in a row",  icon: "🌍" },
  15: { headline: "Legendary",       sub: "15 in a row",  icon: "👑" },
  20: { headline: "Are you human?",  sub: "20 in a row",  icon: "🤖" },
};

function getCopy(streak) {
  const milestones = Object.keys(MILESTONE_COPY).map(Number).sort((a, b) => b - a);
  for (const m of milestones) {
    if (streak >= m) return MILESTONE_COPY[m];
  }
  return MILESTONE_COPY[3];
}

export function MilestoneBurst({ streak, totalScore, onContinue }) {
  const { headline, sub, icon } = getCopy(streak);

  return (
    <div className={styles.overlay} onClick={onContinue}>
      <div className={styles.burst}>
        <div className={styles.ring} />
        <div className={styles.ring2} />
      </div>

      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={styles.headline}>{headline}</h2>
        <p className={styles.sub}>{sub}</p>
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>Total score</span>
          <span className={styles.scoreNum}>{totalScore.toLocaleString()}</span>
        </div>
        <p className={styles.tap}>Tap to keep going</p>
      </div>
    </div>
  );
}
