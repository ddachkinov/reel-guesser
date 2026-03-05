import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 60; // px

export function useSwipe({ onSwipeUp, onSwipeLeft, onSwipeRight } = {}) {
  const startRef = useRef(null);
  const activeRef = useRef(false);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
    activeRef.current = true;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!activeRef.current || !startRef.current) return;
    activeRef.current = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > SWIPE_THRESHOLD && absDy > absDx * 1.2) {
      if (dy < 0) onSwipeUp?.();
    } else if (absDx > SWIPE_THRESHOLD && absDx > absDy * 1.2) {
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    startRef.current = null;
  }, [onSwipeUp, onSwipeLeft, onSwipeRight]);

  const onTouchCancel = useCallback(() => {
    activeRef.current = false;
    startRef.current = null;
  }, []);

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
