import styles from "./BriefReveal.module.css";

// Shown for ~2s after a correct answer, then auto-advances.
// Displays country name + one quick fact over the frozen slide.
export function BriefReveal({ country }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <span className={styles.emoji}>{country.emoji}</span>
        <h2 className={styles.name}>{country.answer}</h2>
        <p className={styles.sub}>{country.capital} · {country.region}</p>
      </div>
    </div>
  );
}
