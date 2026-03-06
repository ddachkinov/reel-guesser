import styles from "./BriefReveal.module.css";

function scoreColor(km) {
  if (km === null || km === undefined) return "#a5b4fc";
  if (km < 500) return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

// Shown briefly after a map guess. Shows country + distance + score.
// onTap: provided only in manual-advance mode.
export function BriefReveal({ country, distanceKm, score, onTap }) {
  const color = scoreColor(distanceKm);
  return (
    <div className={styles.overlay} onClick={onTap} style={{ cursor: onTap ? "pointer" : "default" }}>
      <div className={styles.card}>
        <span className={styles.emoji}>{country.emoji}</span>
        <h2 className={styles.name}>{country.answer}</h2>
        <p className={styles.sub}>{country.capital} · {country.region}</p>
        {distanceKm != null && (
          <div className={styles.scoreRow}>
            <span className={styles.dist} style={{ color }}>
              {distanceKm.toLocaleString()} km off
            </span>
            <span className={styles.pts} style={{ color }}>+{score} pts</span>
          </div>
        )}
      </div>
    </div>
  );
}
