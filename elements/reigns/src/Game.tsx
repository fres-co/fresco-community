import React, { useEffect } from "react";
import { useSelector, useStore } from "react-redux";
import { GamePhase, VICTORY_FLAG_NAME, VICTORY_FLAG_VALUE } from "./constants";
import { usePersistIsMounted } from "./features/host/usePersistIsMounted";
import { AppState } from "./store";
import { useVoteListener } from "./features/voting/useVoteListener";
import { useCollateVotes } from "./features/voting/useCollateVotes";
import { Game as GamePersistence } from "./features/game/Game";
import { getIsHost } from "./features/host/persistence";
import { Countdown } from "./Countdown";
import { getSdk } from "./sdk";
import { EndedScreen } from "./screens/EndedScreen/EndedScreen";
import { NotStartedScreen } from "./screens/NotStartedScreen";
import { StartedScreen } from "./screens/StartedScreen";

export const Game = () => {
  const currentHost = useSelector((state: AppState) => state.host.currentHost);
  const countdown = Countdown.from(
    useSelector((state: AppState) => state.voting.countdown)
  );
  const phase = useSelector((state: AppState) => state.game.phase);
  const isGameWon = useSelector(
    (state: AppState) =>
      state.game.flags[VICTORY_FLAG_NAME] === VICTORY_FLAG_VALUE
  );

  const round = useSelector((state: AppState) => state.game.round);
  const selectedCard = useSelector(
    (state: AppState) => state.game.selectedCard
  );
  const currentStats = useSelector((state: AppState) => state.game.stats);
  const gameDefinition = useSelector(
    (state: AppState) => state.game.definition
  );
  const store = useStore<AppState>();
  const isHost = getIsHost({ currentHost });
  const yesProgress = useSelector(
    (state: AppState) => state.voting.yesProgress
  );
  const noProgress = useSelector((state: AppState) => state.voting.noProgress);
  const yesVotesMissing = useSelector(
    (state: AppState) => state.voting.yesVotesMissing
  );
  const noVotesMissing = useSelector(
    (state: AppState) => state.voting.noVotesMissing
  );

  usePersistIsMounted();

  useVoteListener(phase);

  useCollateVotes();

  useEffect(() => {
    const sdk = getSdk();
    if (phase === GamePhase.ENDED) {
      if (isGameWon) {
        sdk.triggerEvent({
          eventName: "custom.reigns.phase.end.victory",
        });
      } else {
        sdk.triggerEvent({
          eventName: "custom.reigns.phase.end.death",
        });
      }
    } else {
      sdk.triggerEvent({
        eventName: `custom.reigns.phase.${phase}`,
      });
    }
  }, [phase, isGameWon]);

  const doRestartGame = () => {
    if (isHost) {
      const gameState = store.getState().game;
      new GamePersistence().startGame(gameState);
    }
  };

  if (phase === GamePhase.NOT_STARTED) {
    return (
      <NotStartedScreen
        gameDefinition={gameDefinition}
        isHost={isHost}
        doRestartGame={doRestartGame}
      />
    );
  }

  if (!gameDefinition) {
    return null;
  }

  if (phase === GamePhase.ENDED) {
    return (
      <EndedScreen
        key="screen"
        gameDefinition={gameDefinition}
        currentStats={currentStats}
        isGameWon={isGameWon}
        round={round}
        isHost={isHost}
        doRestartGame={doRestartGame}
      />
    );
  }

  if (!selectedCard) {
    return null;
  }

  return (
    <StartedScreen
      key="screen"
      gameDefinition={gameDefinition}
      currentStats={currentStats}
      round={round}
      selectedCard={selectedCard}
      countdown={countdown}
      doRestartGame={doRestartGame}
      noProgress={noProgress}
      yesProgress={yesProgress}
      noVotesMissing={noVotesMissing}
      yesVotesMissing={yesVotesMissing}
    />
  );
};
