import { useState, useCallback } from "react";
import { getDailyCountry, getRandomCountry } from "../data/countries";

export const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  REVEALING: "revealing",   // correct map guess — brief country reveal, then auto/manual advance
  SKIPPED: "skipped",       // user skipped without guessing
  MILESTONE: "milestone",   // streak hit 3/5/10/15/20
};

// Frame indices
export const FRAME = { PHOTO: 0, FACT: 1, MAP: 2 };
export const MAX_FRAMES = 3;

const MILESTONE_STREAKS = new Set([3, 5, 10, 15, 20]);

// Distance-based scoring: 1000 pts at 0 km, 0 pts at 5000+ km
export function distanceToScore(km) {
  return Math.max(0, Math.round(1000 * Math.max(0, 1 - km / 5000)));
}

// Haversine formula — returns distance in km
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
  const [frameIndex, setFrameIndex] = useState(0);
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
    setFrameIndex(0);
    setPhase(PHASE.PLAYING);
    setLastScore(null);
    setLastDistanceKm(null);
    setShowScorePop(false);
  }, []);

  const startGame = useCallback(() => {
    _load(null);
  }, [_load]);

  const nextFrame = useCallback(() => {
    setFrameIndex((i) => Math.min(i + 1, MAX_FRAMES - 1));
  }, []);

  const prevFrame = useCallback(() => {
    setFrameIndex((i) => Math.max(i - 1, 0));
  }, []);

  const submitMapGuess = useCallback((guessLat, guessLng) => {
    if (!country) return;
    const [ansLat, ansLng] = country.mapCenter;
    const km = Math.round(haversine(guessLat, guessLng, ansLat, ansLng));
    const points = distanceToScore(km);

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
    }, 400);
  }, [country, totalScore, gamesPlayed, streak]);

  const skipCountry = useCallback(() => {
    const newStreak = 0;
    setStreak(newStreak);
    setPhase(PHASE.SKIPPED);
    try { localStorage.setItem("rg_streak", "0"); } catch {}
  }, []);

  const advance = useCallback(() => {
    _load(country?.id);
  }, [_load, country]);

  return {
    country,
    phase,
    frameIndex,
    lastScore,
    lastDistanceKm,
    showScorePop,
    totalScore,
    gamesPlayed,
    streak,
    maxFrames: MAX_FRAMES,
    startGame,
    nextFrame,
    prevFrame,
    submitMapGuess,
    skipCountry,
    advance,
  };
}
