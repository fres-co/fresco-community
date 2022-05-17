import React, { useEffect } from "react";
import { Meters } from "./Meters";
import { Question } from "./Question";
import { NoAnswer } from "./NoAnswer";
import { YesAnswer } from "./YesAnswer";
import { useSelector, useDispatch, useStore } from "react-redux";
import {
  answerNo,
  answerYes,
  initializeGame,
  startGame,
  updateGame,
} from "./features/game/gameSlice";
import { GamePhase } from "./constants";
import { AppState } from "./features/game/types";

const useFresco = function () {
  const dispatch = useDispatch();

  useEffect(() => {
    fresco.onReady(function () {
      fresco.onStateChanged(function () {
        const state = fresco.element.state;
        console.log("onStateChanged", state);
        dispatch(
          updateGame({
            ...state,
            isController: fresco.localParticipant.isController,
          })
        );
      });

      const defaultState = {
        selectedCard: null,
        phase: GamePhase.LOADING,
        stats: [],
        gameUrl: "games/gdpr.json",
      };

      fresco.initialize(defaultState, {
        title: "Reigns",
        toolbarButtons: [
          {
            title: "Game url",
            ui: { type: "string" },
            property: "gameUrl",
          },
        ],
      });
    });
  }, []);

  const store = useStore<AppState>();
  const updateFrescoState = () => {
    const state = store.getState();
    console.log("updateFrescoGameState", state);
    fresco.setState({
      phase: state.game.phase,
      selectedCard: state.game.selectedCard,
      stats: state.game.stats,
    });
  };

  const teleport = (
    target: string,
    targetPrefix = `${fresco.element.appearance.NAME}-`
  ) =>
    fresco.send({
      type: "extension/out/redux",
      payload: {
        action: {
          type: "TELEPORT",
          payload: { anchorName: `${targetPrefix}${target}` },
        },
      },
    });

  return { updateFrescoState, teleport };
};

export default function App() {
  const phase = useSelector((state: AppState) => state.game.phase);
  const isController = useSelector(
    (state: AppState) => state.game.isController
  );
  const selectedCard = useSelector(
    (state: AppState) => state.game.selectedCard
  );
  const currentStats = useSelector((state: AppState) => state.game.stats);
  const gameUrl = useSelector((state: AppState) => state.game.gameUrl);
  const gameDefinition = useSelector(
    (state: AppState) => state.game.definition
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!gameUrl) {
      return;
    }
    dispatch(initializeGame(gameUrl) as any);
  }, [gameUrl]);
  const { updateFrescoState, teleport } = useFresco();

  const doAnswerNo = () => {
    // TODO: host will call this in FRES-1112
    if (isController) {
      dispatch(answerNo());
      updateFrescoState();
      // TODO: teleport everyone
      teleport("neutral");
    }
  };

  const doAnswerYes = () => {
    // TODO: host will call this in FRES-1112
    if (isController) {
      dispatch(answerYes());
      updateFrescoState();
      // TODO: teleport everyone
      teleport("neutral");
    }
  };

  useEffect(() => {
    if (phase === GamePhase.STARTED) {
      const yesListener = fresco.subscribeToGlobalEvent(
        "custom.reign.yes",
        () => {
          doAnswerYes();
        }
      );

      const noListener = fresco.subscribeToGlobalEvent(
        "custom.reign.no",
        () => {
          doAnswerNo();
        }
      );

      return () => {
        yesListener();
        noListener();
      };
    }
  }, [phase]);

  const doStartGame = () => {
    dispatch(startGame());
    updateFrescoState();
  };

  if (phase === GamePhase.LOADING) {
    return <div className="death">Loading...</div>;
  }

  if (phase === GamePhase.ERROR) {
    return <div className="death">ERROR :(</div>;
  }

  if (phase === GamePhase.ENDED) {
    return (
      <div className="death" onClick={doStartGame}>
        {gameDefinition?.deathMessage}
      </div>
    );
  }

  if (phase === GamePhase.NOT_STARTED) {
    return (
      <div className="death" onClick={doStartGame}>
        Click to start
      </div>
    );
  }

  if (!selectedCard) {
    return null;
  }

  return (
    <>
      <Meters stats={currentStats} />
      <Question card={selectedCard} />
      <div className="answers">
        <NoAnswer text={selectedCard.answer_no || "No"} onClick={doAnswerNo} />
        <div className="answer answer--neutral" />
        <YesAnswer
          text={selectedCard.answer_yes || "Yes"}
          onClick={doAnswerYes}
        />
      </div>
    </>
  );
}
