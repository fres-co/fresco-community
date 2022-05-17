import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GamePhase } from "../../constants";
import { selectNextCard } from "./selectNextCard";
import { CardFlag, GameFlags, GameState, Stat } from "./types";
import { getFlags, validateGameDefinition } from "./validateGameDefinition";

export const initializeGame = createAsyncThunk(
  "game/initializeGame",
  async (gameUrl: string, thunkAPI) => {
    const response = await fetch(gameUrl);
    console.log("GAME", "response", response);

    const json = await response.json();
    console.log("GAME", "json", json);

    return json;
  }
);

export const setFlags = (gameFlags: GameFlags, cardFlags: CardFlag[]) => {
  const flags = { ...gameFlags };
  cardFlags.forEach(({ key, value }) => {
    flags[key] = value;
  });
  return flags;
};

function setValue(statUpdate: number, stat: Stat, state: GameState) {
  if (!statUpdate) {
    return;
  }

  stat.value += statUpdate;
  stat.value = Math.min(100, Math.max(0, stat.value));
  if (stat.value === 0) {
    state.phase = GamePhase.ENDED;
  }
}

export const initialState: GameState = {
  phase: GamePhase.LOADING,
  selectedCard: null,
  stats: [],
  flags: {},
  gameUrl: null,
  definition: null,
  isController: false,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGame: (state, action) => {
      state.phase = action.payload.phase;
      state.selectedCard = action.payload.selectedCard;
      state.stats = action.payload.stats;
      state.gameUrl = action.payload.gameUrl;
      state.isController = action.payload.isController;
    },
    startGame: (state: GameState) => {
      state.phase = GamePhase.STARTED;
      state.selectedCard = selectNextCard(state);
      state.stats = state.definition
        ? state.definition.stats.map((stat: Stat) => ({ ...stat }))
        : [];
    },
    answerNo: (state: GameState) => {
      if (state.selectedCard) {
        setValue(state.selectedCard.no_stat1, state.stats[0], state);
        setValue(state.selectedCard.no_stat2, state.stats[1], state);
        setValue(state.selectedCard.no_stat3, state.stats[2], state);
        setValue(state.selectedCard.no_stat4, state.stats[3], state);
        state.flags = setFlags(
          state.flags,
          getFlags(state.selectedCard, "no_custom")
        );
      }
      state.selectedCard = selectNextCard(state);
    },
    answerYes: (state) => {
      if (state.selectedCard) {
        setValue(state.selectedCard.yes_stat1, state.stats[0], state);
        setValue(state.selectedCard.yes_stat2, state.stats[1], state);
        setValue(state.selectedCard.yes_stat3, state.stats[2], state);
        setValue(state.selectedCard.yes_stat4, state.stats[3], state);
        state.flags = setFlags(
          state.flags,
          getFlags(state.selectedCard, "yes_custom")
        );
      }
      state.selectedCard = selectNextCard(state);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(initializeGame.pending, (state, action) => {
        state.phase = GamePhase.LOADING;
        console.log("GAME", "loading");
      })
      .addCase(initializeGame.fulfilled, (state, action) => {
        if (state.phase === GamePhase.LOADING) {
          state.phase = GamePhase.NOT_STARTED;
        }

        try {
          state.definition = validateGameDefinition(action.payload);
        } catch (e) {
          console.error(e);
          state.phase = GamePhase.ERROR;
        }

        console.log("GAME", "action.payload", action.payload);
      })
      .addCase(initializeGame.rejected, (state, action) => {
        state.phase = GamePhase.ERROR;
        console.log("GAME", "failed", action);
      });
  },
});

export const { updateGame, startGame, answerNo, answerYes } = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
