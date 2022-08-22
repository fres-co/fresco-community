import React from "react";
import { Header } from "../../Header";
import { Card, GameDefinition } from "../../features/game/types";
import { useTextFit } from "../../useTextFit";
import { getEndMessage } from "./utils";
import { StartedScreen } from "../StartedScreen";
import { useVotes } from "../ConnectedStartedScreen";
import { GamePhase } from "../../constants";

export function EndedScreen({
  gameDefinition,
  currentStats,
  isGameWon,
  round,
  isHost,
  doRestartGame,
}: {
  gameDefinition: GameDefinition;
  currentStats: number[];
  isGameWon: boolean;
  round: number;
  isHost: string | boolean | undefined;
  doRestartGame: () => void;
}) {
  const endMessage = getEndMessage(gameDefinition, currentStats, isGameWon);
  const messageRef = useTextFit(endMessage, 86);

  const progress = useVotes();

  return <StartedScreen
    gameDefinition={gameDefinition}
    {...progress}
    selectedCard={{card: endMessage, answer_yes: 'Play again', bearer: 'the-duck' } as Card}
    currentStats={currentStats}
    round={round}
    doRestartGame={doRestartGame}
    phase={GamePhase.ENDED}
  />
  
}
