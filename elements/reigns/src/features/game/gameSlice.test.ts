import { GamePhase, Loading } from "../../constants";
import { gameReducer, initializeGame } from "./gameSlice";
import { mockSdk } from "./mocks";
import { createGameDefinition, createGameState } from "./objectMother";
import { GameState } from "./types";

describe("gameSlice", () => {
  beforeEach(() => {
    mockSdk();
  });
  describe("gameReducer", () => {
    describe("initialize", () => {
      it("should enter error state if validation fails", () => {
        const result = gameReducer(
          {} as GameState,
          initializeGame.fulfilled(createGameDefinition({ cards: [] }), "", "")
        );
        expect(result.loading).toBe(Loading.Error);
      });
      it("should not set NOT_STARTED if already started", () => {
        const result = gameReducer(
          {
            phase: GamePhase.STARTED,
          } as GameState,
          initializeGame.fulfilled(createGameState().definition, "", "")
        );
        expect(result.phase).toBe(GamePhase.STARTED);
      });
    });
  });
});
