import { useState, useEffect, useCallback } from "react";
import { getDailyCountry, getRandomCountry } from "../data/countries";

export const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  CORRECT: "correct",
  GAVE_UP: "gave_up",
};

const MAX_CLUES = 5;

function calcScore(cluesUsed, timeMs) {
  const baseScores = [1000, 750, 500, 300, 150];
  const base = baseScores[Math.min(cluesUsed - 1, baseScores.length - 1)];
  // Speed bonus: up to +200 pts for solving within 10 seconds
  const speedBonus = Math.max(0, Math.floor(200 - timeMs / 50));
  return base + speedBonus;
}

export function useGameState() {
  const [country, setCountry] = useState(null);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState(null);
  const [totalScore, setTotalScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("reelguesser_total") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    try {
      return parseInt(localStorage.getItem("reelguesser_games") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [streak, setStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("reelguesser_streak") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [mode, setMode] = useState("daily"); // "daily" | "endless"

  const startGame = useCallback((gameMode = "daily") => {
    setMode(gameMode);
    const c = gameMode === "daily" ? getDailyCountry() : getRandomCountry(country?.id);
    setCountry(c);
    setPhase(PHASE.PLAYING);
    setCurrentClueIndex(0);
    setGuess("");
    setWrongGuesses([]);
    setStartTime(Date.now());
    setScore(null);
  }, [country]);

  const revealNextClue = useCallback(() => {
    if (currentClueIndex < MAX_CLUES - 1) {
      setCurrentClueIndex((i) => i + 1);
    }
  }, [currentClueIndex]);

  const submitGuess = useCallback(() => {
    if (!guess.trim() || !country) return;

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = country.answer.toLowerCase();

    if (
      normalizedGuess === normalizedAnswer ||
      normalizedAnswer.includes(normalizedGuess) ||
      normalizedGuess.includes(normalizedAnswer)
    ) {
      const elapsed = Date.now() - startTime;
      const points = calcScore(currentClueIndex + 1, elapsed);
      setScore(points);
      setPhase(PHASE.CORRECT);

      const newTotal = totalScore + points;
      const newGames = gamesPlayed + 1;
      const newStreak = streak + 1;
      setTotalScore(newTotal);
      setGamesPlayed(newGames);
      setStreak(newStreak);

      try {
        localStorage.setItem("reelguesser_total", newTotal.toString());
        localStorage.setItem("reelguesser_games", newGames.toString());
        localStorage.setItem("reelguesser_streak", newStreak.toString());
      } catch {}
    } else {
      setWrongGuesses((prev) => [...prev, guess.trim()]);
      setGuess("");
      // Automatically reveal next clue on wrong guess
      if (currentClueIndex < MAX_CLUES - 1) {
        setCurrentClueIndex((i) => i + 1);
      }
    }
  }, [guess, country, startTime, currentClueIndex, totalScore, gamesPlayed, streak]);

  const giveUp = useCallback(() => {
    setPhase(PHASE.GAVE_UP);
    const newStreak = 0;
    setStreak(newStreak);
    try {
      localStorage.setItem("reelguesser_streak", "0");
    } catch {}
  }, []);

  const nextGame = useCallback(() => {
    startGame(mode === "daily" ? "endless" : "endless");
  }, [mode, startGame]);

  return {
    country,
    phase,
    currentClueIndex,
    guess,
    setGuess,
    wrongGuesses,
    score,
    totalScore,
    gamesPlayed,
    streak,
    mode,
    maxClues: MAX_CLUES,
    startGame,
    revealNextClue,
    submitGuess,
    giveUp,
    nextGame,
  };
}
