import { useState, useCallback } from "react";
import { getDailyCountry, getRandomCountry, COUNTRIES } from "../data/countries";

export const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  CORRECT: "correct",
  GAVE_UP: "gave_up",
};

const MAX_CLUES = 5;

function calcScore(cluesUsed) {
  const baseScores = [1000, 750, 500, 300, 150];
  return baseScores[Math.min(cluesUsed - 1, baseScores.length - 1)];
}

function generateChoices(correctCountry) {
  const wrong = COUNTRIES.filter((c) => c.id !== correctCountry.id);
  const shuffled = [...wrong].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffled, correctCountry]
    .sort(() => Math.random() - 0.5)
    .map((c) => ({ id: c.id, answer: c.answer, emoji: c.emoji }));
}

export function useGameState() {
  const [country, setCountry] = useState(null);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongChoices, setWrongChoices] = useState([]);
  const [score, setScore] = useState(null);
  const [mode, setMode] = useState("daily");

  const [totalScore, setTotalScore] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_total") || "0", 10); } catch { return 0; }
  });
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_games") || "0", 10); } catch { return 0; }
  });
  const [streak, setStreak] = useState(() => {
    try { return parseInt(localStorage.getItem("rg_streak") || "0", 10); } catch { return 0; }
  });

  const startGame = useCallback((gameMode = "daily") => {
    setMode(gameMode);
    const c = gameMode === "daily" ? getDailyCountry() : getRandomCountry(country?.id);
    setCountry(c);
    setChoices(generateChoices(c));
    setPhase(PHASE.PLAYING);
    setCurrentClueIndex(0);
    setSelectedChoice(null);
    setWrongChoices([]);
    setScore(null);
  }, [country]);

  const revealNextClue = useCallback(() => {
    setCurrentClueIndex((i) => Math.min(i + 1, MAX_CLUES - 1));
  }, []);

  const selectChoice = useCallback((choiceId) => {
    // Ignore taps while animating a wrong answer or after correct
    if (selectedChoice !== null) return;
    if (wrongChoices.includes(choiceId)) return;

    setSelectedChoice(choiceId);

    if (choiceId === country.id) {
      const points = calcScore(currentClueIndex + 1);
      setScore(points);
      const newTotal = totalScore + points;
      const newGames = gamesPlayed + 1;
      const newStreak = streak + 1;
      setTotalScore(newTotal);
      setGamesPlayed(newGames);
      setStreak(newStreak);
      try {
        localStorage.setItem("rg_total", newTotal.toString());
        localStorage.setItem("rg_games", newGames.toString());
        localStorage.setItem("rg_streak", newStreak.toString());
      } catch {}
      setTimeout(() => setPhase(PHASE.CORRECT), 1100);
    } else {
      setWrongChoices((prev) => [...prev, choiceId]);
      setTimeout(() => {
        setSelectedChoice(null);
        setCurrentClueIndex((i) => Math.min(i + 1, MAX_CLUES - 1));
      }, 800);
    }
  }, [selectedChoice, wrongChoices, country, currentClueIndex, totalScore, gamesPlayed, streak]);

  const giveUp = useCallback(() => {
    setPhase(PHASE.GAVE_UP);
    setStreak(0);
    try { localStorage.setItem("rg_streak", "0"); } catch {}
  }, []);

  const nextGame = useCallback(() => {
    startGame("endless");
  }, [startGame]);

  return {
    country,
    phase,
    currentClueIndex,
    choices,
    selectedChoice,
    wrongChoices,
    score,
    totalScore,
    gamesPlayed,
    streak,
    mode,
    maxClues: MAX_CLUES,
    startGame,
    revealNextClue,
    selectChoice,
    giveUp,
    nextGame,
  };
}
