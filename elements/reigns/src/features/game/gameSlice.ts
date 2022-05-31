import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GamePhase, Loading } from "../../constants";
import { Configuration, GameState, PersistedGameState } from "./types";
import { validateGameDefinition } from "./validateGameDefinition";

export const initializeGame = createAsyncThunk(
  "game/initializeGame",
  async (gameUrl: string) => {
    const response = await fetch(gameUrl);
    const json = await response.json();
    return json;
  }
);

export const initialState: GameState = {
  loading: Loading.InProgress,
  phase: GamePhase.NOT_STARTED,
  selectedCard: null,
  stats: [],
  flags: {},
  gameUrl: null,
  definition: null,
  round: 0,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGame: (state, action: PayloadAction<PersistedGameState>) => {
      state.phase = action.payload.phase;
      state.flags = action.payload.flags;
      state.round = action.payload.round;
      state.selectedCard = action.payload.selectedCard;
      state.stats = action.payload.stats;
    },
    setPhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
    },
    updateConfig: (state, action: PayloadAction<Configuration>) => {
      state.gameUrl = action.payload.gameUrl;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(initializeGame.pending, (state) => {
        state.loading = Loading.InProgress;
        console.log("GAME", "loading");
      })
      .addCase(initializeGame.fulfilled, (state, action) => {
        state.loading = Loading.Ended;

        try {
          state.definition = validateGameDefinition(action.payload);
        } catch (e) {
          console.error(e);
          state.loading = Loading.Error;
        }

        console.log("GAME", "action.payload", action.payload);
      })
      .addCase(initializeGame.rejected, (state, action) => {
        state.loading = Loading.Error;
        console.log("GAME", "failed", action);
      });
  },
});

export const { updateGame, updateConfig, setPhase } = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
