import { Card, GameDefinition } from "../../features/game/types";
import { getEndMessage } from "./utils";
import { VotingScreen } from "../VotingScreen";
import { useVotes } from "../../useVotes";
import { GamePhase } from "../../constants";

export function EndedScreen({
  gameDefinition,
  currentStats,
  isGameWon,
  round,
}: {
  gameDefinition: GameDefinition;
  currentStats: number[];
  isGameWon: boolean;
  round: number;
  isHost: string | boolean | undefined;
}) {
  const endMessage = getEndMessage(gameDefinition, currentStats, isGameWon);
  const votes = useVotes();

  return (
    <VotingScreen
      gameDefinition={gameDefinition}
      {...votes}
      selectedCard={
        {
          card: endMessage,
          answer_yes: "Play again",
        } as Card
      }
      currentStats={currentStats}
      round={round}
      phase={GamePhase.ENDED}
    />
  );
}
