import styles from "./GaveUpOverlay.module.css";

export function GaveUpOverlay({ country, onNext }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <span className={styles.emoji}>{country.emoji}</span>
        <p className={styles.label}>It was</p>
        <h2 className={styles.name}>{country.answer}</h2>
        <p className={styles.sub}>{country.capital} · {country.region}</p>
        <button className={styles.nextBtn} onClick={onNext}>
          Try the next one →
        </button>
      </div>
    </div>
  );
}
