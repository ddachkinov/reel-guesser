import { useState, useEffect } from "react";
import styles from "./BriefReveal.module.css";

function scoreColor(km, inside, isCityRound) {
  if (km === null || km === undefined) return "#f87171";
  if (inside) return "#34d399";
  if (isCityRound) {
    if (km < 200) return "#34d399";
    if (km < 800) return "#fbbf24";
    return "#f87171";
  }
  if (km < 500)  return "#34d399";
  if (km < 2000) return "#fbbf24";
  return "#f87171";
}

function scoreLabel(km, inside, isCityRound) {
  if (km === null) return "Time's up!";
  if (inside) return isCityRound ? "Spot on! 🎯" : "Right country!";
  if (isCityRound) {
    if (km < 200)  return "Very close!";
    if (km < 800)  return "Not bad";
    if (km < 3000) return "Keep going";
    return "Way off";
  }
  if (km < 500)  return "So close!";
  if (km < 2000) return "Not bad";
  if (km < 4000) return "Keep going";
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

export function BriefReveal({ country, distanceKm, score, insideCountry, onTap }) {
  const isCityRound = country.type === "city";
  const color = scoreColor(distanceKm, insideCountry, isCityRound);
  const label = scoreLabel(distanceKm, insideCountry, isCityRound);
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
        <p className={styles.sub}>
          {isCityRound ? country.capital : `${country.capital} · ${country.region}`}
        </p>

        <div className={styles.resultLabel} style={{ color }}>{label}</div>

        <div className={styles.scoreRow}>
          {!timedOut && (
            <>
              <div className={styles.metric}>
                <span className={styles.metricValue} style={{ color: insideCountry ? "rgba(255,255,255,0.45)" : color }}>
                  {animatedKm.toLocaleString()}
                </span>
                <span className={styles.metricUnit}>
                  {insideCountry
                    ? (isCityRound ? "km from city" : "km from center")
                    : "km off"}
                </span>
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

        {onTap && (
          <button className={styles.nextBtn} onClick={onTap}>
            Next round
            <span className={styles.nextArrow}>↑</span>
          </button>
        )}
      </div>
    </div>
  );
}
