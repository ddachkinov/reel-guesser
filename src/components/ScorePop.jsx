import { useEffect, useRef } from "react";
import styles from "./ScorePop.module.css";

export function ScorePop({ score, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div ref={ref} className={styles.pop}>
      +{score}
    </div>
  );
}
