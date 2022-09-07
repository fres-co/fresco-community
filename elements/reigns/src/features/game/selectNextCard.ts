import { Card, GameDefinition, GameFlags } from "./types";
import { getConditions } from "./validateGameDefinition";
import * as self from "./selectNextCard";
import { INFINITE_CARD_WEIGHT } from "../../constants";

export const cardsDistributedByWeight = (cards: Card[]) => {
  const cardWithMaximumWeights = cards.filter(
    (card) => card.weight === INFINITE_CARD_WEIGHT
  );
  if (cardWithMaximumWeights.length > 0) {
    return cardWithMaximumWeights;
  }

  return cards.flatMap((card) =>
    [...Array(card.weight).keys()].map(() => card)
  );
};

export const STAT_FLAG_NAME_REGEXP = /^stat(\d)+$/;

export const cardsRestrictedByFlags = (
  cards: Card[],
  gameFlags: GameFlags,
  stats: number[]
) =>
  cards.filter((card) => {
    if (!card.conditions) return card;
    const conditions = getConditions(card);
    return conditions.every(({ key, value, operator }) => {
      const statMatch = key.match(STAT_FLAG_NAME_REGEXP);
      if (statMatch) {
        const statIndex = Number(statMatch[1]) - 1;
        const statValue = stats[statIndex];
        if (statValue !== undefined) {
          return operator(statValue as never, Number(value) as never);
        }
      }

      const flag = gameFlags[key];

      if (flag === undefined) {
        return value === "false";
      }

      return operator(flag as never, value as never);
    });
  });

const getAllValidCards = (
  definition: GameDefinition | null,
  flags: GameFlags,
  designerCards: Card[] | null = null,
  stats: number[],
  previouslySelectedCardIds: string[]
) => {
  if (!definition) {
    return [];
  }
  const restrictedByFlags = cardsRestrictedByFlags(
    designerCards ?? definition.cards,
    flags,
    stats
  );

  const availableCards = removeCardsOnCooldown(
    restrictedByFlags,
    previouslySelectedCardIds
  );

  return cardsDistributedByWeight(availableCards);
};

export const selectNextCard = (
  definition: GameDefinition | null,
  flags: GameFlags,
  designerCards: Card[] | undefined,
  stats: number[],
  previouslySelectedCardIds: string[]
) => {
  const validCards = getAllValidCards(
    definition,
    flags,
    designerCards,
    stats,
    previouslySelectedCardIds
  );

  const randomCard = validCards[Math.floor(Math.random() * validCards.length)];

  return {
    ...randomCard,
  };
};

export const removeCardsOnCooldown = (
  allCards: Card[],
  previouslySelectedCardIds: string[]
) => {
  if (previouslySelectedCardIds.length === 0) {
    return allCards;
  }

  const cardsNotOnCooldown = allCards.filter(
    (card) => !self.isCardOnCooldown(previouslySelectedCardIds, card)
  );

  if (cardsNotOnCooldown.length > 0) {
    return cardsNotOnCooldown;
  }

  return allCards;
};

export function isCardOnCooldown(
  previouslySelectedCardIds: string[],
  card: Card
): boolean {
  const round = previouslySelectedCardIds.length + 1;

  const lastPlayedIndex = previouslySelectedCardIds.findIndex(
    (id) => id === card.id
  );

  if (lastPlayedIndex === -1) {
    // card was never played
    return false;
  }

  const cooldownValue = card.cooldown ?? Infinity;
  const lastPlayedRound = previouslySelectedCardIds.length - lastPlayedIndex;

  return !(round > lastPlayedRound + cooldownValue);
}

const STAT_CHANGES: (keyof Card)[] = [
  "no_stat1",
  "no_stat2",
  "no_stat3",
  "no_stat4",
  "yes_stat1",
  "yes_stat2",
  "yes_stat3",
  "yes_stat4",
];

export const hasStatChange = (card: Card) =>
  STAT_CHANGES.some(
    (statChange) => card[statChange] !== undefined && card[statChange] !== 0
  );
