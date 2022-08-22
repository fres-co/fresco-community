import { GameDefinition } from "../features/game/types";
import { VotingScreen } from "./VotingScreen";
import { GamePhase } from "../constants";
import { useVotes } from "../useVotes";

export const StartedScreen = ({
  gameDefinition,
  currentStats,
  round,
}: {
  gameDefinition: GameDefinition;
  currentStats: number[];
  round: number;
}) => {
  const votes = useVotes();

  if (votes.selectedCard === null) {
    return null;
  }

  return (
    <VotingScreen
      {...votes}
      selectedCard={votes.selectedCard}
      gameDefinition={gameDefinition}
      currentStats={currentStats}
      round={round}
      phase={GamePhase.STARTED}
    />
  );
};
