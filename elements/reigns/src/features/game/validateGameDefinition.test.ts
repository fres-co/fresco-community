import { Card, GameDefinition } from "./types";
import {
  validateCards,
  getFlags,
  validateFlags,
  getConditions,
  validateGameDefinition,
  validateConditions,
  parseCondition,
} from "./validateGameDefinition";
import gdpr from "../../../public/games/gdpr.json";
import demo from "../../../public/games/demo.json";

import dont_starve from "../../../public/games/dont-starve.json";

describe("validateGameDefinition", () => {
  describe("validateCards", () => {
    it("should succeed if cards are valid", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should throw if no cards", () => {
      expect(() => validateCards([])).toThrow();
    });

    it("should throw if weight less than 1", () => {
      expect(() => validateCards([{ weight: 0 } as Card])).toThrow();
    });

    it("should throw if weight higher than 100", () => {
      expect(() => validateCards([{ weight: 101 } as Card])).toThrow();
    });

    it("should throw if bad conditions", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            conditions: "some rubbish",
          } as Card,
        ])
      ).toThrow();
    });

    it("should pass with two cards with differnt ids", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            id: "some-card",
          } as Card,
          {
            card: "another card",
            weight: 1,
            id: "another-card",
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should throw with two card with same ids", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            id: "card-id",
          } as Card,

          {
            card: "another card",
            weight: 1,
            id: "card-id",
          } as Card,
        ])
      ).toThrow();
    });

    it("should throw with two card with no ids", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
          } as Card,

          {
            card: "another card",
            weight: 1,
          } as Card,
        ])
      ).toThrow();
    });

    it("should pass if good conditions", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            conditions: "someCondition==true",
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should not throw if cooldown is a positive number", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            cooldown: 10,
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should not throw if cooldown is a 0", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            cooldown: 0,
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should not throw if cooldown is not defined", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
          } as Card,
        ])
      ).not.toThrow();
    });

    it("should throw if cooldown is an empty string", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            cooldown: "" as any,
          } as Card,
        ])
      ).toThrow();
    });

    it("should throw if cooldown is an number string", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            cooldown: "10" as any,
          } as Card,
        ])
      ).toThrow();
    });

    it("should throw if cooldown is an float string", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            cooldown: 3.5 as any,
          } as Card,
        ])
      ).toThrow();
    });
  });

  describe("getFlags", () => {
    const getCard = () =>
      ({
        yes_custom: "someFlag=true",
        no_custom: "someOtherFlag=true",
      } as Card);
    it("should return empty array if no flags", () => {
      expect(getFlags({} as Card, "yes_custom")).toEqual([]);
    });

    it("should return no flags", () => {
      const result = getFlags(getCard(), "no_custom");
      expect(result).toEqual([
        expect.objectContaining({ key: "someOtherFlag", value: "true" }),
      ]);
    });

    it("should return yes flags", () => {
      const result = getFlags(getCard(), "yes_custom");
      expect(result).toEqual([
        expect.objectContaining({ key: "someFlag", value: "true" }),
      ]);
    });
  });

  describe("validateFlags", () => {
    const validate = (flag: string) =>
      validateFlags(
        getFlags({ yes_custom: flag } as Card, "yes_custom"),
        "yes_custom",
        1
      );
    it("should throw on multiple operators", () => {
      expect(() => validate("key==true")).toThrow();
    });

    it("should allow multiple flags separated by space", () => {
      expect(() => validate("key1=true key2=true")).not.toThrow();
    });

    it("should throw if duplicate flag", () => {
      expect(() => validate("key1=true key1=true")).toThrow();
    });

    it("should throw if value not boolean", () => {
      expect(() => validate("key1=not_a_boolean")).toThrow();
    });
  });

  describe("validateConditions", () => {
    const validate = (flag: string) =>
      validateConditions(
        getConditions({ conditions: flag } as Card),
        "conditions",
        1
      );
    it("should throw on multiple operators", () => {
      expect(() => validate("a==b==true")).toThrow();
    });

    it("should allow multiple flags separated by space", () => {
      expect(() => validate("key1==true key2==true")).not.toThrow();
    });

    it("should throw if duplicate flag", () => {
      expect(() => validate("key1==true key1==true")).toThrow();
    });

    it("should throw if value not boolean", () => {
      expect(() => validate("key1==not_a_boolean")).toThrow();
    });
  });

  describe("games", () => {
    it("should validate gdpr", () => {
      const iterator = gdpr.cards.values();
      const cards: Card[] = Array.from(iterator);
      expect(() => validateCards(cards)).not.toThrow();
    });
    it("should validate dont_starve", () => {
      const iterator = dont_starve.cards.values();
      const cards: Card[] = Array.from(iterator);
      expect(() => validateCards(cards)).not.toThrow();
    });
    it("should validate demo", () => {
      const iterator = demo.cards.values();
      const cards: Card[] = Array.from(iterator);
      expect(() => validateCards(cards)).not.toThrow();
    });
  });

  describe("validateGameDefinition", () => {
    const getDefinition = (
      cards: Card[] = [
        { card: "foo", id: "fooId", weight: 1 },
        { card: "bar", id: "barId", weight: 1 },
      ] as Card[]
    ) => ({
      cards,
      stats: [{ name: "foo", value: 0, icon: "" }],
      assetsUrl: "",
      deathMessage: "Sorry",
      victoryMessage: "Victory !",
      victoryRoundThreshold: 0,
      roundName: "day",
      gameName: "Welcome",
    });

    it("should returns cards provided with id", () => {
      const definitionCards = [
        { card: "foo", id: "fooId", weight: 1 },
        { card: "bar", id: "barId", weight: 1 },
      ] as Card[];
      const gameDefinition = validateGameDefinition(
        getDefinition(definitionCards)
      );

      expect(gameDefinition.cards).toEqual(definitionCards);
    });

    it("should generate ids for cards without id", () => {
      const definitionCards = [
        { card: "foo", weight: 1 },
        { card: "bar", id: "barId", weight: 1 },
        { card: "baz", weight: 1 },
      ] as Card[];

      const gameDefinition = validateGameDefinition(
        getDefinition(definitionCards)
      );

      expect(gameDefinition.cards.length).toBe(3);
      expect(gameDefinition.cards[0]).toEqual({
        ...definitionCards[0],
        id: "index-0",
      });
      expect(gameDefinition.cards[1]).toEqual(definitionCards[1]);
      expect(gameDefinition.cards[2]).toEqual({
        ...definitionCards[2],
        id: "index-2",
      });
    });

    it("should provide default for victoryRoundThreshold when not defined", () => {
      const definition = getDefinition();
      delete (definition as any).victoryRoundThreshold;
      const gameDefinition = validateGameDefinition(definition);

      expect(gameDefinition.victoryRoundThreshold).toBe(0);
    });

    it("should provide default for victoryRoundThreshold when null", () => {
      const definition = getDefinition();
      (definition as any).victoryRoundThreshold = null;
      const gameDefinition = validateGameDefinition(definition);

      expect(gameDefinition.victoryRoundThreshold).toBe(0);
    });

    it("should keep provided victoryRoundThreshold", () => {
      const definition = getDefinition();
      definition.victoryRoundThreshold = 123;

      const gameDefinition = validateGameDefinition(definition);
      expect(gameDefinition.victoryRoundThreshold).toBe(123);
    });
  });

  describe("parseCondition", () => {
    it("parse an stat equal condition", () => {
      const condition = parseCondition("stat1==40");
      expect(condition.key).toBe("stat1");
      expect(condition.value).toBe("40");
      expect(condition.separator).toBe("==");
    });

    it("parse an custom flag equal true", () => {
      const condition = parseCondition("fooFlag_42bar==true");
      expect(condition.key).toBe("fooFlag_42bar");
      expect(condition.value).toBe("true");
      expect(condition.separator).toBe("==");
    });

    it("parse an custom flag equal false", () => {
      const condition = parseCondition("fooFlag_42bar==false");
      expect(condition.key).toBe("fooFlag_42bar");
      expect(condition.value).toBe("false");
      expect(condition.separator).toBe("==");
    });

    it("throw on custom flag equal another string", () => {
      expect(() => parseCondition("fooFlag_42bar==falsy")).toThrow();
    });

    it("parse on custom flag equal a number", () => {
      // this is not valid ATM but will be thrown by validateConditions not the parsing
      const condition = parseCondition("fooFlag_42bar==42");
      expect(condition.key).toBe("fooFlag_42bar");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe("==");
    });

    it("parse a stat big with a bigger or equal sign", () => {
      const condition = parseCondition("stat21>=42");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe(">=");
    });

    it("parse a stat big with a bigger than sign", () => {
      const condition = parseCondition("stat21>42");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe(">");
    });

    it("parse a stat big with a lower or equal sign", () => {
      const condition = parseCondition("stat21<=42");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe("<=");
    });

    it("parse a stat big with a lower than sign", () => {
      const condition = parseCondition("stat21<42");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe("<");
    });

    it("parse a stat big with a not equal sign", () => {
      const condition = parseCondition("stat21!=42");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("42");
      expect(condition.separator).toBe("!=");
    });

    it("parse a stat big with an equal boolean sign", () => {
      // this is not valid ATM but will be thrown by validateConditions not the parsing
      const condition = parseCondition("stat21==true");
      expect(condition.key).toBe("stat21");
      expect(condition.value).toBe("true");
      expect(condition.separator).toBe("==");
    });

    it("throw on stat with unknow operator", () => {
      // this is not valid ATM but will be thrown by validateConditions not the parsing
      expect(() => parseCondition("stat43+=42")).toThrow();
    });

    it("throw on stat with bigger than false ", () => {
      // this is not valid ATM but will be thrown by validateConditions not the parsing
      expect(() => parseCondition("stat43>true")).toThrow();
    });
  });

  describe("validateConditions", () => {
    it("validates a card with no flags", () => {
      expect(() => validateConditions([], "conditions", 0)).not.toThrow();
    });

    it("throw on a card with condition checking a stat against true", () => {
      expect(() =>
        validateConditions(
          [{ key: "stat1", value: "true", operator: () => true }],
          "conditions",
          0
        )
      ).toThrow();
    });

    it("throw on a card with condition checking a stat against false", () => {
      expect(() =>
        validateConditions(
          [{ key: "stat1", value: "false", operator: () => true }],
          "conditions",
          0
        )
      ).toThrow();
    });

    it("throw on a card with condition checking a stat against a random string", () => {
      expect(() =>
        validateConditions(
          [{ key: "stat1", value: "foo", operator: () => true }],
          "conditions",
          0
        )
      ).toThrow();
    });

    it("validates on a card with stat condition checking a stat against an integer string", () => {
      expect(() =>
        validateConditions(
          [{ key: "stat1", value: "43", operator: () => true }],
          "conditions",
          0
        )
      ).not.toThrow();
    });

    it("throw on a card with custom condition checking a stat against an integer string", () => {
      expect(() =>
        validateConditions(
          [{ key: "foo", value: "43", operator: () => true }],
          "conditions",
          0
        )
      ).toThrow();
    });

    it("validates on a card with custom condition checking against true", () => {
      expect(() =>
        validateConditions(
          [{ key: "foo", value: "true", operator: () => true }],
          "conditions",
          0
        )
      ).not.toThrow();
    });

    it("validates on a card with custom condition checking against false", () => {
      expect(() =>
        validateConditions(
          [{ key: "foo", value: "true", operator: () => true }],
          "conditions",
          0
        )
      ).not.toThrow();
    });

    it("throw on a card with custom condition checking against random string", () => {
      expect(() =>
        validateConditions(
          [{ key: "foo", value: "bar", operator: () => true }],
          "conditions",
          0
        )
      ).toThrow();
    });
  });
});
