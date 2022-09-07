import { GamePhase } from "../../constants";
import { getSdk } from "../../sdk";
import {
  getGameVote,
  PARTICIPANT_VOTE_TABLE,
  persistGameVote,
  persistParticipantVote,
} from "../voting/persistence";
import { Game, GAME_STATE_KEY, GAME_TABLE } from "./Game";
import { mockSdk } from "../../mocks";
import {
  createCard,
  createGameDefinition,
  createGameState,
} from "./objectMother";

describe("Game", () => {
  beforeEach(() => {
    mockSdk();
  });

  describe("startGame", () => {
    it("should select a card and set round to 1", () => {
      const result = new Game()
        .startGame(
          createGameState(
            createGameDefinition({
              cards: [createCard({ card: "another card" })],
            })
          )
        )
        .retrieve();
      expect(result.selectedCard?.card).toBe("another card");
      expect(result.round).toBe(1);
    });
    it("should clear flags", () => {
      const game = new Game();
      const state = createGameState(createGameDefinition(), {
        flags: {
          chapter3: "true",
        },
      });
      getSdk().storage.realtime.set(GAME_TABLE, GAME_STATE_KEY, state);
      expect(game.retrieve().flags.chapter3).toBe("true");

      game.startGame(state);

      expect(game.retrieve().flags.chapter3).toBe(undefined);
    });

    it("should select first cards no matter or previous flags", () => {
      const game = new Game();
      const prevState = createGameState(createGameDefinition(), {
        flags: {
          chapter3: "true",
        },
      });
      getSdk().storage.realtime.set(GAME_TABLE, GAME_STATE_KEY, prevState);
      expect(game.retrieve().flags.chapter3).toBe("true");

      const newGameState = createGameState(
        createGameDefinition({
          cards: [
            createCard({ card: "initial card" }),
            createCard({
              card: "chapter 3 intro",
              conditions: "chapter3==true",
            }),
          ],
        }),
        {
          flags: {
            chapter3: "true",
          },
        }
      );

      game.startGame(newGameState);

      const results = game.retrieve();
      expect(results.flags.chapter3).toBe(undefined);

      expect(results.selectedCard?.card).toBe("initial card");
      expect(results.round).toBe(1);
    });

    it("sets show_resources=true when card selected with with non-zero stat change", () => {
      const state = createGameState(
        createGameDefinition({
          cards: [
            createCard({
              card: "card with stat change",
              no_stat1: 1,
            }),
          ],
        })
      );
      const game = new Game().startGame(state);
      expect(game.retrieve().flags.show_resources).toBe("true");
    });
    it("does not set show_resources=true when card selected with zero stat change", () => {
      const state = createGameState(
        createGameDefinition({
          cards: [
            createCard({
              card: "card with no stat change",
              no_stat1: 0,
            }),
          ],
        })
      );
      const game = new Game().startGame(state);
      expect(game.retrieve().flags.show_resources).toBeUndefined();
    });
  });

  describe("answerYes", () => {
    it("should select a card", () => {
      const result = new Game()
        .answerYes(
          createGameState(
            createGameDefinition({
              cards: [createCard({ card: "another card" })],
            })
          )
        )
        .retrieve();
      expect(result.selectedCard?.card).toBe("another card");
    });
  });

  describe("answerNo", () => {
    it("should select a card", () => {
      const result = new Game()
        .answerNo(
          createGameState(
            createGameDefinition({
              cards: [createCard({ card: "another card" })],
            })
          )
        )
        .retrieve();
      expect(result.selectedCard?.card).toBe("another card");
    });

    it("sets show_resources=true when card selected with with non-zero stat change", () => {
      const state = createGameState(
        createGameDefinition({
          cards: [
            createCard({
              card: "card with no stat change",
              no_stat1: 0,
              cooldown: 1,
              weight: 100,
            }),
            createCard({
              card: "card with stat change",
              no_stat1: 1,
              weight: 1,
            }),
          ],
        })
      );

      const turn1 = new Game().startGame(state).retrieve();
      const turn2 = new Game().answerNo({ ...state, ...turn1 }).retrieve();
      expect(turn2.flags.show_resources).toBe("true");
    });

    it("does not set show_resources=true when card selected with zero stat change", () => {
      const state = createGameState(
        createGameDefinition({
          cards: [
            createCard({
              card: "card with no stat change",
              no_stat1: 0,
              weight: 100,
            }),
            createCard({
              card: "card with no stat change",
              no_stat1: 0,
              weight: 1,
            }),
          ],
        })
      );

      const turn1 = new Game().startGame(state).retrieve();
      const turn2 = new Game().answerNo({ ...state, ...turn1 }).retrieve();
      expect(turn2.flags.show_resources).toBeUndefined();
    });
  });

  describe("conditions", () => {
    it("can step through conditions", () => {
      const card1 = createCard({
        conditions: "dragon_killed==false",
        card: "Kill the dragon?",
        yes_custom: "dragon_killed=true",
      });

      const card2 = createCard({
        conditions: "dragon_killed==true",
        card: "Have a feast?",
      });

      const gameState = createGameState(
        createGameDefinition({
          cards: [card1, card2],
          deathMessage: "You died",
          assetsUrl: "test",
          stats: [{ value: 0, icon: "icon", name: "stat" }],
        })
      );

      const turn1 = new Game().startGame(gameState).retrieve();
      expect(turn1.selectedCard?.card).toBe("Kill the dragon?");

      const turn2 = new Game().answerNo({ ...gameState, ...turn1 }).retrieve();
      expect(turn2.selectedCard?.card).toBe("Kill the dragon?");

      const turn3 = new Game().answerYes({ ...gameState, ...turn1 }).retrieve();
      expect(turn3.selectedCard?.card).toBe("Have a feast?");
    });
  });
});
