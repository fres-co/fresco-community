import { Card } from "./types";
import {
  validateCards,
  getFlags,
  validateFlags,
  getConditions,
} from "./validateGameDefinition";
import gdpr from "../../../public/games/gdpr.json";
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
            conditions: "some rubbish",
            id: "some-card",
          } as Card,
          {
            card: "another card",
            weight: 1,
            conditions: "more rubbish",
            id: "another-card",
          } as Card,
        ])
      ).toThrow();
    });

    it("should throw with two card with same ids", () => {
      expect(() =>
        validateCards([
          {
            card: "some card",
            weight: 1,
            conditions: "some rubbish",
            id: "card-id",
          } as Card,

          {
            card: "another card",
            weight: 1,
            conditions: "more rubbish",
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
            conditions: "some rubbish",
          } as Card,

          {
            card: "another card",
            weight: 1,
            conditions: "more rubbish",
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
      expect(result).toEqual([{ key: "someOtherFlag", value: "true" }]);
    });

    it("should return yes flags", () => {
      const result = getFlags(getCard(), "yes_custom");
      expect(result).toEqual([{ key: "someFlag", value: "true" }]);
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
      validateFlags(
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
  });
});
