import { configureStore } from "@reduxjs/toolkit";
import { gameChangeListenerMiddleware } from "./features/game/gameChangeListener";
import { gameReducer } from "./features/game/gameSlice";
import { reducer as hostReducer } from "./features/host/hostSlice";
import { reducer as votingReducer } from "./features/voting/votingSlice";

export const createStore = () =>
  configureStore({
    reducer: {
      game: gameReducer,
      host: hostReducer,
      voting: votingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(gameChangeListenerMiddleware.middleware),
  });

export type AppState = ReturnType<ReturnType<typeof createStore>["getState"]>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];
