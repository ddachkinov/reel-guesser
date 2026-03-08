import { useState } from "react";
import { useGameState, PHASE } from "./hooks/useGameState";
import { IntroScreen } from "./components/IntroScreen";
import { GameScreen } from "./components/GameScreen";
import "./App.css";

export default function App() {
  const game = useGameState();
  const [autoAdvance, setAutoAdvance] = useState(true);

  if (game.phase === PHASE.INTRO || !game.country) {
    return (
      <div className="app-shell">
        <div className="scroll-container">
          <IntroScreen
            onStart={game.startGame}
            totalScore={game.totalScore}
            gamesPlayed={game.gamesPlayed}
            streak={game.streak}
            autoAdvance={autoAdvance}
            onToggleAutoAdvance={() => setAutoAdvance((v) => !v)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <GameScreen
        country={game.country}
        phase={game.phase}
        clueIndex={game.clueIndex}
        cluesViewed={game.cluesViewed}
        lastScore={game.lastScore}
        lastDistanceKm={game.lastDistanceKm}
        showScorePop={game.showScorePop}
        totalScore={game.totalScore}
        streak={game.streak}
        autoAdvance={autoAdvance}
        cycleClue={game.cycleClue}
        submitMapGuess={game.submitMapGuess}
        timeoutGuess={game.timeoutGuess}
        skipCountry={game.skipCountry}
        advance={game.advance}
      />
    </div>
  );
}
