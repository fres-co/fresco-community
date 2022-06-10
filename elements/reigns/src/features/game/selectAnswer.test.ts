import { GamePhase } from "../../constants";
import { Game } from "./Game";
import { mockSdk } from "./mocks";
import { createCard, createGameState } from "./objectMother";
import { setFlags } from "./selectAnswer";

describe("selectAnswer", () => {
  beforeEach(() => {
    mockSdk();
  });
  describe("setFlags", () => {
    it("should set multiple flags", () => {
      const flags = setFlags({}, [
        { key: "chapter3", value: "true" },
        { key: "queen_killed", value: "false" },
      ]);
      expect(flags.chapter3).toBe("true");
      expect(flags.queen_killed).toBe("false");
    });

    it("should leave existing flags", () => {
      const flags = setFlags({ chapter3: "true" }, [
        { key: "queen_killed", value: "false" },
      ]);
      expect(flags.chapter3).toBe("true");
    });
  });
  it("should set round to 1 at start", () => {
    const result = new Game()
      .startGame(createGameState(undefined, { round: 234234 }))
      .retrieve();
    expect(result.round).toBe(1);
  });
  it("should increment round on yes", () => {
    const result = new Game()
      .answerYes(createGameState(undefined, { round: 1 }))
      .retrieve();
    expect(result.round).toBe(2);
  });
  it("should increment round on no", () => {
    const result = new Game()
      .answerNo(createGameState(undefined, { round: 1 }))
      .retrieve();
    expect(result.round).toBe(2);
  });
  it("should end game if a card reduces a stat to zero", () => {
    const result = new Game()
      .answerYes(
        createGameState(undefined, {
          selectedCard: createCard({
            yes_stat1: -1,
          }),
          stats: [1],
          phase: GamePhase.STARTED,
        })
      )
      .retrieve();
    expect(result.phase).toBe(GamePhase.ENDED);
  });
  it("should not end game if a stat is already zero and not updated by a card", () => {
    const result = new Game()
      .answerYes(
        createGameState(undefined, {
          selectedCard: createCard({
            yes_stat1: -1,
            yes_stat2: 0,
          }),
          stats: [4, 0],
          phase: GamePhase.STARTED,
        })
      )
      .retrieve();
    expect(result.phase).toBe(GamePhase.STARTED);
  });
});
