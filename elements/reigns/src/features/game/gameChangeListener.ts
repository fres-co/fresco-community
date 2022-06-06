import {
  createListenerMiddleware,
  TypedStartListening,
} from "@reduxjs/toolkit";

import { AppDispatch, AppState } from "../../store";
import { updateConfig } from "./gameSlice";
import { getIsHost } from "../host/persistence";
import { Game } from "./Game";

export const gameChangeListenerMiddleware = createListenerMiddleware();

type AppStartListening = TypedStartListening<AppState, AppDispatch>;
const startAppListening =
  gameChangeListenerMiddleware.startListening as AppStartListening;

startAppListening({
  actionCreator: updateConfig,
  effect: (action, listenerApi) => {
    detectGameChange(listenerApi.getOriginalState(), action.payload.gameUrl);
  },
});

export const detectGameChange = (state: AppState, gameUrl: string) => {
  const isHost = getIsHost(state.host);

  if (!isHost) return;
  if (!state.game.gameUrl) return;

  if (gameUrl !== state.game.gameUrl) {
    new Game().changeGame();
  }
};
