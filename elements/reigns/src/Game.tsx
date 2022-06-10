import React, { useEffect } from "react";
import { Header } from "./Header";
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

  usePersistIsMounted();

  useVoteListener(phase);

  useCollateVotes();

  useEffect(() => {
    if (phase === GamePhase.ENDED) {
      const audio = new Audio("error.mp3");
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
          <div className="round">{gameDefinition?.roundName} {round}</div>
          <div className="death__message">{gameDefinition?.deathMessage}</div>
          {isHost && <button onClick={doRestartGame}>Play again</button>}
        </div>
      </>
    );
  }

  if (phase === GamePhase.NOT_STARTED) {
    return (
      <div className="death" >
        {isHost && <button onClick={doRestartGame}>Start game</button>}
        {!isHost && <div>Waiting for host to start</div>}
      </div>
    );
  }

  if (!selectedCard || !gameDefinition) {
    return null;
  }

  return (
    <>
      <Header definition={gameDefinition} stats={currentStats} round={round} />
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
