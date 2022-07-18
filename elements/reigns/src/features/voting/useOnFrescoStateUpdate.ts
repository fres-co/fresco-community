import { useRef, useState } from "react";
import { useDispatch, useStore } from "react-redux";
import { setPhase, updateConfig, updateGame } from "../game/gameSlice";
import { updateHost } from "../host/hostSlice";
import { updateVote } from "./votingSlice";
import { persistIsInsideElement } from "./persistIsInsideElement";
import { getSdk } from "../../sdk";
import { Game } from "../game/Game";
import { GamePhase, QUESTION_CHANGE_DELAY, RESSOURCE_DELAY, TELEPORT_DELAY } from "../../constants";
import { AppState } from "../../store";
import { PersistedGameState } from "../game/types";
import { teleport } from "./teleport";
import { endQuestionAndAnswersTransition, endRoundTransition, startQuestionAndAnswersTransition, startRoundTransition } from "../transition/fadeSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";

export const PARTICIPANT_INSIDE_TABLE = "participants-inside";

export const useOnFrescoStateUpdate = () => {

  const dispatch = useDispatch();
  const store = useStore();

  const prevLocalParticipantRef = useRef<{
    id: string | null;
    isInsideElement: boolean | null;
  }>({ id: null, isInsideElement: null });
  return () => {

    const prevState = store.getState() as AppState;
    const state = new Game().retrieve();

    if (state) {
      if(state.round > prevState.game.round){
        if(!prevState.transition.round) {
          void animateRoundTransition(dispatch, prevState, state);
        }
      } else {
       dispatch(
         updateGame({
           flags: state.flags,
           phase: state.phase,
           round: state.round,
           selectedCard: state.selectedCard,
           stats: state.stats,
           previouslySelectedCardIds: state.previouslySelectedCardIds,
         })
       );
     }
    } else {
      dispatch(setPhase(GamePhase.NOT_STARTED));
    }
    const sdk = getSdk();
    if (sdk.element.state) {
      dispatch(
        updateConfig({
          gameUrl: sdk.element.state.gameUrl,
          designerCardsCsv: sdk.element.state.cards,
        })
      );
    }
    dispatch(updateHost());
    dispatch(updateVote());
    persistIsInsideElement(prevLocalParticipantRef);
  };
};


const animateRoundTransition = async (dispatch: Dispatch<AnyAction>, storedState: AppState, state:PersistedGameState) => {
    dispatch(startRoundTransition())
    await wait(TELEPORT_DELAY)
    teleport('neutral');
    await wait(RESSOURCE_DELAY)
    dispatch(updateGame({ ...storedState.game, stats: state.stats }))
    dispatch(startQuestionAndAnswersTransition())
    await wait(QUESTION_CHANGE_DELAY);
    dispatch(updateGame({ ...storedState.game, ...state }));
    dispatch(endQuestionAndAnswersTransition())
    dispatch(endRoundTransition())
}

const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))