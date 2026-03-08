import { useState, useEffect } from "react";
import styles from "./BriefReveal.module.css";

function scoreColor(km) {
  if (km === null || km === undefined) return "#f87171"; // timeout = red
  if (km < 500) return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

function scoreLabel(km) {
  if (km === null) return "Time's up!";
  if (km < 100)   return "Bullseye!";
  if (km < 500)   return "So close!";
  if (km < 2000)  return "Not bad";
  if (km < 4000)  return "Keep going";
  return "Way off";
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null || target === 0) { setValue(0); return; }
    let raf;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function BriefReveal({ country, distanceKm, score, onTap }) {
  const color = scoreColor(distanceKm);
  const label = scoreLabel(distanceKm);
  const timedOut = distanceKm === null;

  const animatedKm    = useCountUp(distanceKm ?? 0, 1200);
  const animatedScore = useCountUp(score ?? 0, 1000);

  // Fact from the second clue (the fact card)
  const fact = country.clues?.[1];

  return (
    <div
      className={styles.overlay}
      onClick={onTap}
      style={{ cursor: onTap ? "pointer" : "default" }}
    >
      <div className={styles.card}>
        <span className={styles.emoji}>{country.emoji}</span>
        <h2 className={styles.name}>{country.answer}</h2>
        <p className={styles.sub}>{country.capital} · {country.region}</p>

        <div className={styles.resultLabel} style={{ color }}>{label}</div>

        <div className={styles.scoreRow}>
          {!timedOut && (
            <>
              <div className={styles.metric}>
                <span className={styles.metricValue} style={{ color }}>
                  {animatedKm.toLocaleString()}
                </span>
                <span className={styles.metricUnit}>km off</span>
              </div>
              <div className={styles.divider} />
            </>
          )}
          <div className={styles.metric}>
            <span className={styles.metricValue} style={{ color }}>
              {timedOut ? "0" : `+${animatedScore}`}
            </span>
            <span className={styles.metricUnit}>points</span>
          </div>
        </div>

        {/* Interesting fact about the location */}
        {fact && (
          <div className={styles.factRow}>
            {fact.icon && <span className={styles.factIcon}>{fact.icon}</span>}
            <p className={styles.factText}>{fact.text}</p>
          </div>
        )}

        {onTap && <p className={styles.tapHint}>Tap to continue</p>}
      </div>
    </div>
  );
}
