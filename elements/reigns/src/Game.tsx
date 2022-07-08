import React, { useEffect } from "react";
import { Header } from "./Header";
import { Question } from "./Question";
import { useSelector, useStore } from "react-redux";
import { GamePhase } from "./constants";
import { usePersistIsMounted } from "./features/host/usePersistIsMounted";
import { AppState } from "./store";
import { useVoteListener } from "./features/voting/useVoteListener";
import { useCollateVotes } from "./features/voting/useCollateVotes";
import { Game as GamePersistence } from "./features/game/Game";
import { getIsHost } from "./features/host/persistence";
import { AnswerArea } from "./AnswerArea";

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
      <div className="game-half first-half">
        <div className="death">
          <div className="round">
            {gameDefinition?.roundName} {round}
          </div>
          <div className="death__message">{gameDefinition?.deathMessage}</div>
          {isHost && <button onClick={doRestartGame}>Play again</button>}
        </div>
      </div>
    );
  }

  if (phase === GamePhase.NOT_STARTED) {
    return (
      <div className="game-half first-half">
        <div className="death">
          <div className="death__message">{gameDefinition?.gameName}</div>
          {isHost && <button onClick={doRestartGame}>Start game</button>}
          {!isHost && <div>Waiting for host to start...</div>}
        </div>
      </div>
    );
  }

  if (!selectedCard || !gameDefinition) {
    return null;
  }

  return (
    <>
      <div className="game-half first-half" onClick={doRestartGame}>
        <Header
          definition={gameDefinition}
          stats={currentStats}
          round={round}
        />
        <Question card={selectedCard} />
      </div>
      <div className="game-half answers">
        <AnswerArea text={selectedCard.answer_no || "No"} answer="no" />
        <div className="answer answer--neutral">
          {(countdown ?? 0) > 0 && (
            <div className="countdown">{countdown}...</div>
          )}
        </div>
        <AnswerArea text={selectedCard.answer_yes || "Yes"} answer="yes" />
      </div>
    </>
  );
};
