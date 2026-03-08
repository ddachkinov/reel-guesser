import styles from "./BriefReveal.module.css";

function scoreColor(km) {
  if (km === null || km === undefined) return "#a5b4fc";
  if (km < 500) return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

function scoreLabel(km) {
  if (km < 100)  return "Bullseye!";
  if (km < 500)  return "So close!";
  if (km < 2000) return "Not bad";
  if (km < 4000) return "Keep going";
  return "Way off";
}

export function BriefReveal({ country, distanceKm, score, onTap }) {
  const color = scoreColor(distanceKm);
  const label = distanceKm != null ? scoreLabel(distanceKm) : "";
  return (
    <div className={styles.overlay} onClick={onTap} style={{ cursor: onTap ? "pointer" : "default" }}>
      <div className={styles.card}>
        <span className={styles.emoji}>{country.emoji}</span>
        <h2 className={styles.name}>{country.answer}</h2>
        <p className={styles.sub}>{country.capital} · {country.region}</p>
        {distanceKm != null && (
          <>
            <div className={styles.resultLabel} style={{ color }}>{label}</div>
            <div className={styles.scoreRow}>
              <div className={styles.metric}>
                <span className={styles.metricValue} style={{ color }}>
                  {distanceKm.toLocaleString()}
                </span>
                <span className={styles.metricUnit}>km off</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.metric}>
                <span className={styles.metricValue} style={{ color }}>
                  +{score}
                </span>
                <span className={styles.metricUnit}>points</span>
              </div>
            </div>
          </>
        )}
        {onTap && <p className={styles.tapHint}>Tap to continue</p>}
      </div>
    </div>
  );
}
