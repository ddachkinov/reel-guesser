import { useEffect } from "react";
import styles from "./CitySlide.module.css";

/**
 * Full-screen text slide for city rounds.
 * Shows the city name, country, and a "find it on the map" prompt.
 * Calls onPhotoReady immediately (no image to wait for).
 */
export function CitySlide({ clue, onPhotoReady }) {
  useEffect(() => {
    onPhotoReady?.();
  }, [onPhotoReady]);

  return (
    <div className={styles.slide}>
      <span className={styles.flag}>{clue.emoji}</span>
      <h1 className={styles.cityName}>{clue.name}</h1>
      <p className={styles.countryName}>{clue.countryName}</p>
      <div className={styles.divider} />
      <p className={styles.instruction}>Find it on the map</p>
    </div>
  );
}
