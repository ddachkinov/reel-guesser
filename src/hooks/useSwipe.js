import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 55; // px minimum travel
const DIRECTION_LOCK = 1.3; // dominant axis multiplier

export function useSwipe({ onSwipeUp, onSwipeLeft, onSwipeRight } = {}) {
  const startRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!startRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    startRef.current = null;

    // Vertical — must be more vertical than horizontal
    if (absDy > SWIPE_THRESHOLD && absDy > absDx * DIRECTION_LOCK) {
      if (dy < 0) onSwipeUp?.();
    // Horizontal — must be more horizontal than vertical
    } else if (absDx > SWIPE_THRESHOLD && absDx > absDy * DIRECTION_LOCK) {
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
  }, [onSwipeUp, onSwipeLeft, onSwipeRight]);

  const onTouchCancel = useCallback(() => { startRef.current = null; }, []);

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
