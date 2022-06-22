import { GamePhase } from "../../constants";
import { getSdk } from "../../sdk";
import { persistAnswer } from "../voting/persistAnswer";
import {
  PARTICIPANT_VOTE_TABLE,
  persistParticipantVote,
} from "../voting/useVoteListener";
import { getLatestVote } from "../voting/votingSlice";
import { Game, GAME_STATE_KEY, GAME_TABLE } from "./Game";
import { mockSdk } from "./mocks";
import {
  createCard,
  createGameDefinition,
  createGameState,
} from "./objectMother";

describe("Game", () => {
  beforeEach(() => {
    mockSdk();
  });
  describe("game over", () => {
    it("should clear participant votes", () => {
      persistAnswer({
        answer: "No",
        countdown: 3,
      });
      persistParticipantVote(getSdk().localParticipant.id, "Yes");

      const result = new Game()
        .answerNo(
          createGameState(undefined, {
            stats: [10],
            selectedCard: createCard({ no_stat1: -20 }),
          })
        )
        .retrieve();

      const answer = getLatestVote();
      expect(answer).toEqual({});

      expect(result.phase).toBe(GamePhase.ENDED);
      expect(getSdk().storage.realtime.all(PARTICIPANT_VOTE_TABLE)).toEqual({});
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
