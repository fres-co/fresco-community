import React, { useEffect } from "react";
import { Meters } from "./Meters";
import { Question } from "./Question";
import { NoAnswer } from "./NoAnswer";
import { YesAnswer } from "./YesAnswer";
import { useSelector, useStore } from "react-redux";
import { GamePhase } from "./constants";
import { usePersistIsMounted } from "./features/host/usePersistIsMounted";
import { AppState } from "./store";
import { useVoteListener } from "./features/voting/useVoteListener";
import { useCollateVotes } from "./features/voting/useCollateVotes";
import { Game as GamePersistence } from "./features/game/Game";
import { getIsHost } from "./features/host/persistence";

export const Game = () => {
  const currentHost = useSelector((state: AppState) => state.host.currentHost);
  const countdown = useSelector((state: AppState) => state.voting.countdown);
  const phase = useSelector((state: AppState) => state.game.phase);
  const selectedCard = useSelector(
    (state: AppState) => state.game.selectedCard
  );
  const currentStats = useSelector((state: AppState) => state.game.stats);
  const gameDefinition = useSelector(
    (state: AppState) => state.game.definition
  );
  const store = useStore<AppState>();
  const isHost = getIsHost({ currentHost });

  usePersistIsMounted();

  useVoteListener(phase);

  useCollateVotes();

  useEffect(() => {
    if (phase === GamePhase.ENDED) {
      // This will cause a delay because the sound has not been pre-loaded first.
      const audio = new Audio('error.mp3');
      audio.play();
    }
  }, [phase]);

  const doRestartGame = () => {
    if (isHost) {
      new GamePersistence().startGame(store.getState().game);
    }
  };

  if (phase === GamePhase.ENDED) {
    return (
      <>
        <div className="death">
          {gameDefinition?.deathMessage}
          {isHost && <div onClick={doRestartGame}>Click to play again</div>}
        </div>
      </>
    );
  }

  if (phase === GamePhase.NOT_STARTED) {
    return (
      <div className="death" onClick={doRestartGame}>
        {isHost ? "Click to start" : "Waiting for host to start"}
      </div>
    );
  }

  if (!selectedCard || !gameDefinition) {
    return null;
  }

  return (
    <>
      <div>The host is {currentHost?.name}</div>
      <Meters definition={gameDefinition} stats={currentStats} />
      <Question card={selectedCard} />
      <div className="answers">
        <NoAnswer text={selectedCard.answer_no || "No"} />
        <div className="answer answer--neutral">
          {(countdown ?? 0) > 0 && (
            <div className="countdown">{countdown}...</div>
          )}
        </div>
        <YesAnswer text={selectedCard.answer_yes || "Yes"} />
      </div>
    </>
  );
};
