import { useState, useCallback } from "react";
import { getRandomCountry } from "../data/countries";

export const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  REVEALING: "revealing",
  SKIPPED: "skipped",
  MILESTONE: "milestone",
};

const MILESTONE_STREAKS = new Set([3, 5, 10, 15, 20]);

// Each additional clue viewed past the first costs 150 pts from the base.
// Floor at 400 so there's always a reason to guess.
export function calcMaxScore(cluesViewed) {
  return Math.max(400, 1000 - (cluesViewed - 1) * 150);
}

// Distance multiplier: 1.0 at 0 km → 0.0 at 5000+ km
export function distanceFactor(km) {
  return Math.max(0, 1 - km / 5000);
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function useGameState() {
  const [country, setCountry] = useState(null);
  const [phase, setPhase] = useState(PHASE.INTRO);
  // Index of currently visible clue (wraps)
  const [clueIndex, setClueIndex] = useState(0);
  // How many distinct clues the player has actually seen (drives score penalty)
  const [cluesViewed, setCluesViewed] = useState(1);
  const [lastScore, setLastScore] = useState(null);
  const [lastDistanceKm, setLastDistanceKm] = useState(null);
  const [showScorePop, setShowScorePop] = useState(false);

  const [totalScore, setTotalScore] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_total") || "0", 10); } catch { return 0; }
  });
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_games") || "0", 10); } catch { return 0; }
  });
  const [streak, setStreak] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_streak") || "0", 10); } catch { return 0; }
  });

  const _load = useCallback((excludeId) => {
    const c = getRandomCountry(excludeId);
    setCountry(c);
    setClueIndex(0);
    setCluesViewed(1);
    setPhase(PHASE.PLAYING);
    setLastScore(null);
    setLastDistanceKm(null);
    setShowScorePop(false);
  }, []);

  const startGame = useCallback(() => _load(null), [_load]);

  // Cycle to next or previous clue; each new clue beyond the first costs points
  const cycleClue = useCallback((direction) => {
    setClueIndex((i) => {
      const len = country?.clues.length ?? 1;
      return direction === "next"
        ? (i + 1) % len
        : (i - 1 + len) % len;
    });
    setCluesViewed((v) => {
      const max = country?.clues.length ?? 1;
      return Math.min(v + 1, max);
    });
  }, [country]);

  const submitMapGuess = useCallback((guessLat, guessLng) => {
    if (!country) return;
    const [ansLat, ansLng] = country.mapCenter;
    const km = Math.round(haversine(guessLat, guessLng, ansLat, ansLng));
    const points = Math.round(calcMaxScore(cluesViewed) * distanceFactor(km));

    setLastScore(points);
    setLastDistanceKm(km);
    setShowScorePop(true);

    const newTotal = totalScore + points;
    const newGames = gamesPlayed + 1;
    const newStreak = points > 0 ? streak + 1 : 0;
    setTotalScore(newTotal);
    setGamesPlayed(newGames);
    setStreak(newStreak);

    try {
      localStorage.setItem("rg_total", newTotal.toString());
      localStorage.setItem("rg_games", newGames.toString());
      localStorage.setItem("rg_streak", newStreak.toString());
    } catch {}

    setTimeout(() => {
      setShowScorePop(false);
      if (MILESTONE_STREAKS.has(newStreak)) {
        setPhase(PHASE.MILESTONE);
      } else {
        setPhase(PHASE.REVEALING);
      }
    }, 700);
  }, [country, cluesViewed, totalScore, gamesPlayed, streak]);

  // Map timer expired with no guess — 0 pts, streak resets, reveal phase
  const timeoutGuess = useCallback(() => {
    setLastScore(0);
    setLastDistanceKm(null); // null = timed out (no coordinates)
    setShowScorePop(false);
    const newGames = gamesPlayed + 1;
    setGamesPlayed(newGames);
    setStreak(0);
    try {
      localStorage.setItem("rg_games", newGames.toString());
      localStorage.setItem("rg_streak", "0");
    } catch {}
    setTimeout(() => setPhase(PHASE.REVEALING), 700);
  }, [gamesPlayed]);

  const skipCountry = useCallback(() => {
    setStreak(0);
    setPhase(PHASE.SKIPPED);
    try { localStorage.setItem("rg_streak", "0"); } catch {}
  }, []);

  const advance = useCallback(() => _load(country?.id), [_load, country]);

  return {
    country,
    phase,
    clueIndex,
    cluesViewed,
    lastScore,
    lastDistanceKm,
    showScorePop,
    totalScore,
    gamesPlayed,
    streak,
    startGame,
    cycleClue,
    submitMapGuess,
    timeoutGuess,
    skipCountry,
    advance,
  };
}
