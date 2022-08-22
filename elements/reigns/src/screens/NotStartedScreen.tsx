import { useEffect } from "react";
import { GamePhase } from "../constants";
import { Game } from "../features/game/Game";
import { GameDefinition } from "../features/game/types";
import { useVotes } from "../useVotes";
import { VotingScreen } from "./VotingScreen";

export function NotStartedScreen({
  gameDefinition,
  isHost,
}: {
  gameDefinition: GameDefinition | null;
  isHost: string | boolean | undefined;
}) {
  const votes = useVotes();
  if (!gameDefinition) {
    // todo loading
    return <div>Loading</div>;
  }

  useEffect(() => {
    if (isHost && gameDefinition) {
      new Game().prepareGame(gameDefinition);
    }
  }, [isHost, gameDefinition]);

  if (!votes.selectedCard) {
    return null;
  }

  return (
    <VotingScreen
      round={0}
      gameDefinition={gameDefinition}
      currentStats={[]}
      {...votes}
      selectedCard={votes.selectedCard}
      phase={GamePhase.NOT_STARTED}
    />
  );
}
