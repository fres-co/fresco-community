import React, { useEffect } from "react";
import { GamePhase } from "../constants";
import { Game } from "../features/game/Game";
import { Card, GameDefinition } from "../features/game/types";
import { useTextFit } from "../useTextFit";
import { useVotes } from "./ConnectedStartedScreen";
import { StartedScreen } from "./StartedScreen";

export function NotStartedScreen({
  gameDefinition,
  isHost,
  doRestartGame,
}: {
  gameDefinition: GameDefinition | null;
  isHost: string | boolean | undefined;
  doRestartGame: () => void;
}) {
  const messageRef = useTextFit(gameDefinition?.gameName);

  const progress = useVotes();
  if (!gameDefinition) {
    // todo loading
    return <div>Loading</div>;
  }

  useEffect(() => {
    if (isHost && gameDefinition) {
      new Game().prepareGame(gameDefinition);
    }
  }, [isHost, gameDefinition]);

  if (!progress.selectedCard) {
    return null;
  }

  return (
    <StartedScreen
      round={0}
      doRestartGame={doRestartGame}
      gameDefinition={gameDefinition}
      currentStats={[]}
      {...progress}
      selectedCard={progress.selectedCard}
      phase={GamePhase.NOT_STARTED}
    />
  );
}
