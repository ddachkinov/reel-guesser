import { useState } from "react";
import styles from "./ClueCard.module.css";

function PhotoClue({ clue }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={styles.photoWrapper}>
      {!loaded && <div className={styles.imageSkeleton} />}
      <img
        src={clue.imageUrl}
        alt="Visual clue"
        className={`${styles.clueImage} ${loaded ? styles.visible : ""}`}
        onLoad={() => setLoaded(true)}
      />
      <div className={styles.attribution}>{clue.attribution}</div>
    </div>
  );
}

function FactClue({ clue }) {
  return (
    <div className={styles.factCard}>
      <span className={styles.factIcon}>{clue.icon}</span>
      <p className={styles.factText}>{clue.text}</p>
    </div>
  );
}

function StatClue({ clue }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.factIcon}>{clue.icon}</span>
      <div className={styles.statGrid}>
        {clue.stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlagClue({ clue }) {
  return (
    <div className={styles.flagCard}>
      <p className={styles.flagLabel}>Flag colors:</p>
      <div className={styles.colorStrips}>
        {clue.colors.map((color, i) => (
          <div
            key={color}
            className={styles.colorStrip}
            style={{ backgroundColor: color }}
          >
            <span className={styles.colorName}>{clue.colorNames[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClueCard({ clue, index, isLatest }) {
  if (!clue) return null;

  const clueNumber = index + 1;

  return (
    <div className={`${styles.clueCard} ${isLatest ? styles.latest : styles.previous}`}>
      <div className={styles.clueHeader}>
        <span className={styles.clueChip}>Clue {clueNumber}</span>
        {!isLatest && <span className={styles.usedChip}>Used</span>}
      </div>

      {clue.type === "photo" && <PhotoClue clue={clue} />}
      {clue.type === "fact" && <FactClue clue={clue} />}
      {clue.type === "stat" && <StatClue clue={clue} />}
      {clue.type === "flag" && <FlagClue clue={clue} />}
    </div>
  );
}
