import { useState, useCallback } from "react";
import { getDailyCountry, getRandomCountry, COUNTRIES } from "../data/countries";

export const PHASE = {
  INTRO: "intro",
  PLAYING: "playing",
  // Sub-phases within a round (no full result screen):
  REVEALING: "revealing",   // correct — brief country name shown for 2s
  GAVE_UP: "gave_up",       // user tapped give-up — minimal overlay, tap to continue
  MILESTONE: "milestone",   // streak hit 3/5/10/15/20 — full burst, tap to continue
};

const MAX_CLUES = 5;
const MILESTONE_STREAKS = new Set([3, 5, 10, 15, 20]);

function calcScore(cluesUsed) {
  return [1000, 750, 500, 300, 150][Math.min(cluesUsed - 1, 4)];
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
  const [lastScore, setLastScore] = useState(null);     // score for this round (shown in pop)
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

  const _loadCountry = useCallback((gameMode, currentId) => {
    const c = gameMode === "daily" ? getDailyCountry() : getRandomCountry(currentId);
    setCountry(c);
    setChoices(generateChoices(c));
    setCurrentClueIndex(0);
    setSelectedChoice(null);
    setWrongChoices([]);
    setLastScore(null);
    setShowScorePop(false);
    setPhase(PHASE.PLAYING);
  }, []);

  const startGame = useCallback((gameMode = "daily") => {
    _loadCountry(gameMode, null);
  }, [_loadCountry]);

  const revealNextClue = useCallback(() => {
    setCurrentClueIndex((i) => Math.min(i + 1, MAX_CLUES - 1));
  }, []);

  const selectChoice = useCallback((choiceId) => {
    if (selectedChoice !== null) return;
    if (wrongChoices.includes(choiceId)) return;

    setSelectedChoice(choiceId);

    if (choiceId === country.id) {
      const points = calcScore(currentClueIndex + 1);
      setLastScore(points);
      setShowScorePop(true);

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

      // Show brief reveal, then either milestone or auto-advance
      setTimeout(() => {
        setShowScorePop(false);
        if (MILESTONE_STREAKS.has(newStreak)) {
          setPhase(PHASE.MILESTONE);
        } else {
          setPhase(PHASE.REVEALING);
        }
      }, 300);
    } else {
      setWrongChoices((prev) => [...prev, choiceId]);
      setTimeout(() => {
        setSelectedChoice(null);
        setCurrentClueIndex((i) => Math.min(i + 1, MAX_CLUES - 1));
      }, 800);
    }
  }, [selectedChoice, wrongChoices, country, currentClueIndex, totalScore, gamesPlayed, streak]);

  const giveUp = useCallback(() => {
    setStreak(0);
    setPhase(PHASE.GAVE_UP);
    try { localStorage.setItem("rg_streak", "0"); } catch {}
  }, []);

  // Called when BriefReveal timer finishes — load next country
  const advanceAfterReveal = useCallback(() => {
    _loadCountry("endless", country?.id);
  }, [_loadCountry, country]);

  // Called when user taps milestone screen or give-up overlay
  const continueAfterBreak = useCallback(() => {
    _loadCountry("endless", country?.id);
  }, [_loadCountry, country]);

  return {
    country,
    phase,
    currentClueIndex,
    choices,
    selectedChoice,
    wrongChoices,
    lastScore,
    showScorePop,
    totalScore,
    gamesPlayed,
    streak,
    maxClues: MAX_CLUES,
    startGame,
    revealNextClue,
    selectChoice,
    giveUp,
    advanceAfterReveal,
    continueAfterBreak,
  };
}
