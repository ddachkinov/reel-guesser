import { useEffect, useRef } from "react";
import styles from "./ScorePop.module.css";

export function ScorePop({ score, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div ref={ref} className={styles.pop}>
      <span className={styles.plus}>+</span>
      <span className={styles.num}>{score}</span>
    </div>
  );
}
