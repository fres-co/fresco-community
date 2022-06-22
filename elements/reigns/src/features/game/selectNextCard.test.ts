import { mockSdk } from "./mocks";
import { Game } from "./Game";
import { createGameState, createGameDefinition } from "./objectMother";
import { parseCardsFromCsv } from "./parseCardsFromCsv";
import * as selectNextCard from "./selectNextCard";

import { Card } from "./types";

const {
  cardsDistributedByWeight,
  cardsRestrictedByFlags,
  isCardCooling,
  removeCoolingCards,
} = selectNextCard;

describe("selectNextCard", () => {
  beforeEach(() => {
    mockSdk();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("cardsDistributedByWeight", () => {
    it("distributes cards by weight", () => {
      const result = cardsDistributedByWeight([
        { card: "card1", weight: 1 } as Card,
        { card: "card2", weight: 5 } as Card,
      ]);

      expect(result.filter((p) => p.card === "card1").length).toBe(1);
      expect(result.filter((p) => p.card === "card2").length).toBe(5);
    });
  });

  describe("cardsRestrictedByFlags", () => {
    it("should return cards not affected by flags", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1 } as Card],
        {}
      );
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ card: "a card" })])
      );
    });

    it("should return cards affected by flag==true when game flag is set", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1, conditions: "flag==true" } as Card],
        { flag: "true" }
      );
      expect(result).toHaveLength(1);
    });

    it("should return cards affected by flag==false when game flag is set", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1, conditions: "flag==false" } as Card],
        { flag: "false" }
      );
      expect(result).toHaveLength(1);
    });

    it("should exclude cards affected by flag==true when game flag is not set", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1, conditions: "flag==true" } as Card],
        {}
      );
      expect(result).toHaveLength(0);
    });

    it("should return cards affected by flag==false when game flag is not set", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1, conditions: "flag==false" } as Card],
        {}
      );
      expect(result).toHaveLength(1);
    });

    it("should return cards without conditions when flags are active", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1 } as Card],
        { flag: "true" }
      );
      expect(result).toHaveLength(1);
    });

    it("should return cards without conditions when flags are inactive", () => {
      const result = cardsRestrictedByFlags(
        [{ card: "a card", weight: 1 } as Card],
        {}
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("isCardCooling", () => {
    it("returns false when no cards was proposed", () => {
      const cardIsCooling = isCardCooling([], {
        card: "foo",
      } as Card);

      expect(cardIsCooling).toBe(false);
    });

    it("returns true when card was proposed and no cooldown", () => {
      const card = { card: "foo", id: "fooCard" } as Card;
      const cardIsCooling = isCardCooling([card], card);

      expect(cardIsCooling).toBe(true);
    });

    it("returns false when card id different", () => {
      const card = { card: "foo", id: "fooCard" } as Card;
      const cardIsCooling = isCardCooling([card], { ...card, id: "barCard" });

      expect(cardIsCooling).toBe(false);
    });

    it("returns false when card was just played and cooldown is 0", () => {
      const card = { card: "foo", cooldown: 0 } as Card;
      const cardIsCooling = isCardCooling([card], card);

      expect(cardIsCooling).toBe(false);
    });

    it("returns true when card was just played and cooldown is 1", () => {
      const card = { card: "foo", cooldown: 1 } as Card;
      const cardIsCooling = isCardCooling([card], card);

      expect(cardIsCooling).toBe(true);
    });

    it("returns false when card was previously played and cooldown is 1", () => {
      const cards = [
        { card: "bar", cooldown: 1, id: "card-bar" } as Card,
        { card: "foo", cooldown: 1, id: "card-foo" } as Card,
      ];
      const cardIsCooling = isCardCooling(cards, cards[1]);

      expect(cardIsCooling).toBe(false);
    });
  });

  describe("removeCoolingCards", () => {
    it("returns original cards array for first round", () => {
      const cards = [
        { card: "card1", cooldown: 1, id: "card-1" } as Card,
        { card: "card2", id: "card-2" } as Card,
      ];

      const filteredCards = removeCoolingCards(cards, []);

      expect(filteredCards).toEqual(cards);
    });

    it("removes cards where isCardCooling function returns true", () => {
      const cards = [
        { card: "card1", id: "card-1", cooldown: 1 } as Card,
        { card: "card2", id: "card-2" } as Card,
        { card: "card3", id: "card-3" } as Card,
        { card: "card4", id: "card-4" } as Card,
      ];

      const isCardCoolingSpy = jest
        .spyOn(selectNextCard, "isCardCooling")
        .mockImplementation(
          (_, card: Card) => card.card === "card2" || card.card === "card3"
        );
      const filteredCards = removeCoolingCards(cards, [
        { card: "hotcards" } as Card,
      ]);

      expect(filteredCards).toEqual([cards[0], cards[3]]);

      isCardCoolingSpy.mockRestore();
    });
  });

  describe("Cooling integration", () => {
    const cards = parseCardsFromCsv(`
card,id,bearer,conditions,cooldown,weight,override_yes,answer_yes,yes_stat1,yes_stat2,yes_stat3,yes_stat4,yes_custom,answer_no,no_stat1,no_stat2,no_stat3,no_stat4,no_custom
cooldown-3,,entrepreneur,,3,100,,Explore,0,0,0,0,,Gather,-500,-500,-500,,
cooldown-0,,customer-support,,0,1,,Fight it,0,0,0,0,,Flee,-500,-500,-500,,`);
    it("selected first card", () => {
      console.log("cards are", cards);
      const gameDefinition = createGameDefinition({
        cards: cards,
      });
      const result = new Game()
        .startGame(createGameState(gameDefinition))
        .retrieve();

      expect(result).toBeDefined();
      expect(result?.selectedCard?.card).toBe("cooldown-3");

      new Game().answerYes(createGameState(gameDefinition, result));

      const afterFirstAnswer = new Game().retrieve();
      expect(afterFirstAnswer?.selectedCard?.card).toBe("cooldown-0");

      new Game().answerYes(createGameState(gameDefinition, afterFirstAnswer));

      const afterSecondAnswer = new Game().retrieve();
      expect(afterSecondAnswer?.selectedCard?.card).toBe("cooldown-0");
    });
  });
});
