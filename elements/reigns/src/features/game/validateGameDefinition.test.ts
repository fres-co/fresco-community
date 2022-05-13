import { Card } from "./types";
import { validateCards, getFlags } from "./validateGameDefinition";
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
  });
  describe("validateFlags", () => {
    const validate = (flag: string) =>
      getFlags({ yes_custom: flag } as Card, "yes_custom", 1);
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