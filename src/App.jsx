import { useGameState, PHASE } from "./hooks/useGameState";
import { IntroScreen } from "./components/IntroScreen";
import { GameScreen } from "./components/GameScreen";
import "./App.css";

export default function App() {
  const game = useGameState();

  if (game.phase === PHASE.INTRO || !game.country) {
    return (
      <div className="app-shell">
        <div className="scroll-container">
          <IntroScreen
            onStart={game.startGame}
            totalScore={game.totalScore}
            gamesPlayed={game.gamesPlayed}
            streak={game.streak}
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
        currentClueIndex={game.currentClueIndex}
        choices={game.choices}
        selectedChoice={game.selectedChoice}
        wrongChoices={game.wrongChoices}
        score={game.score}
        streak={game.streak}
        maxClues={game.maxClues}
        onSelectChoice={game.selectChoice}
        onGiveUp={game.giveUp}
        onRevealNext={game.revealNextClue}
        onNext={game.nextGame}
      />
    </div>
  );
}
