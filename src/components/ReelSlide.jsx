import { useState } from "react";
import styles from "./ReelSlide.module.css";

function PhotoSlide({ clue }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={styles.photoSlide}>
      {!loaded && <div className={styles.skeleton} />}
      <img
        src={clue.imageUrl}
        alt=""
        className={`${styles.photo} ${loaded ? styles.photoLoaded : ""}`}
        onLoad={() => setLoaded(true)}
      />
      <div className={styles.photoGradientTop} />
      <div className={styles.photoGradientBottom} />
      <div className={styles.attribution}>{clue.attribution}</div>
    </div>
  );
}

function FactSlide({ clue }) {
  return (
    <div className={styles.textSlide}>
      <div className={styles.textSlideInner}>
        <span className={styles.bigIcon}>{clue.icon}</span>
        <p className={styles.factText}>{clue.text}</p>
      </div>
    </div>
  );
}

function StatSlide({ clue }) {
  return (
    <div className={styles.textSlide}>
      <div className={styles.textSlideInner}>
        <span className={styles.bigIcon}>{clue.icon}</span>
        <div className={styles.statsStack}>
          {clue.stats.map((s) => (
            <div key={s.label} className={styles.statRow}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlagSlide({ clue }) {
  return (
    <div className={styles.textSlide}>
      <div className={styles.textSlideInner}>
        <p className={styles.flagHeading}>Flag colors</p>
        <div className={styles.flagStrips}>
          {clue.colors.map((color, i) => (
            <div key={color} className={styles.flagStrip} style={{ background: color }}>
              <span className={styles.flagColorName}>{clue.colorNames[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReelSlide({ clue, isEntering, isExiting, direction }) {
  const animClass = isEntering
    ? direction === "up" ? styles.enterFromBottom : styles.enterFromTop
    : isExiting
    ? direction === "up" ? styles.exitToTop : styles.exitToBottom
    : styles.visible;

  return (
    <div className={`${styles.slide} ${animClass}`}>
      {clue.type === "photo" && <PhotoSlide clue={clue} />}
      {clue.type === "fact" && <FactSlide clue={clue} />}
      {clue.type === "stat" && <StatSlide clue={clue} />}
      {clue.type === "flag" && <FlagSlide clue={clue} />}
    </div>
  );
}
