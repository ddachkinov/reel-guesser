import { useRef, useState, useCallback } from "react";

// ── Gesture-driven swipe hook ──────────────────────────────────
// Returns continuous drag offset so the UI can follow the finger,
// plus committed swipe callbacks when the gesture completes.
//
// Physics: velocity-aware — a fast flick commits even at short distance.

const COMMIT_DISTANCE = 60;   // px — slow drag must travel this far
const FLICK_VELOCITY = 0.35;  // px/ms — fast flick commits at any distance > 20px
const FLICK_MIN_PX = 20;      // minimum px for a flick
const DIRECTION_LOCK = 1.2;   // axis ratio to lock direction

export function useSwipe({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onDragX,            // (dx) => void — continuous horizontal offset
  onDragY,            // (dy) => void — continuous vertical offset
  onDragEnd,          // () => void — drag released without committing
  enabled = true,
  commitDistance = COMMIT_DISTANCE,  // override per call-site
  flickMinPx = FLICK_MIN_PX,         // override per call-site
} = {}) {
  const startRef = useRef(null);
  const axisRef = useRef(null); // "x" | "y" | null — locks after first move
  const [dragging, setDragging] = useState(false);

  const onTouchStart = useCallback((e) => {
    if (!enabled) return;
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    axisRef.current = null;
    setDragging(true);
  }, [enabled]);

  const onTouchMove = useCallback((e) => {
    if (!enabled || !startRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Lock axis on first significant movement
    if (!axisRef.current && (absDx > 8 || absDy > 8)) {
      axisRef.current = absDx > absDy * DIRECTION_LOCK ? "x"
                       : absDy > absDx * DIRECTION_LOCK ? "y"
                       : absDx > absDy ? "x" : "y";
    }

    if (axisRef.current === "x" && onDragX) {
      onDragX(dx);
    } else if (axisRef.current === "y" && onDragY) {
      // Only report upward drag (negative dy) for opening map
      onDragY(dy);
    }
  }, [enabled, onDragX, onDragY]);

  const onTouchEnd = useCallback((e) => {
    if (!enabled || !startRef.current) return;
    setDragging(false);

    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const elapsed = Math.max(1, Date.now() - startRef.current.time);
    const axis = axisRef.current;
    startRef.current = null;
    axisRef.current = null;

    // Calculate velocity (px/ms)
    const vx = absDx / elapsed;
    const vy = absDy / elapsed;

    let committed = false;

    if (axis === "y") {
      const isFlick = vy > FLICK_VELOCITY && absDy > flickMinPx;
      const isSlide = absDy > commitDistance;
      if (isFlick || isSlide) {
        if (dy < 0) { onSwipeUp?.(); committed = true; }
        else { onSwipeDown?.(); committed = true; }
      }
    } else if (axis === "x") {
      const isFlick = vx > FLICK_VELOCITY && absDx > flickMinPx;
      const isSlide = absDx > commitDistance;
      if (isFlick || isSlide) {
        if (dx < 0) { onSwipeLeft?.(); committed = true; }
        else { onSwipeRight?.(); committed = true; }
      }
    }

    if (!committed) {
      onDragEnd?.();
    }
  }, [enabled, commitDistance, flickMinPx, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onDragEnd]);

  const onTouchCancel = useCallback(() => {
    startRef.current = null;
    axisRef.current = null;
    setDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, dragging };
}
