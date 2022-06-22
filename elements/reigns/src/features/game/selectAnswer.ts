import { GamePhase } from "../../constants";
import { Game } from "../../Game";
import { selectNextCard } from "./selectNextCard";
import {
  Card,
  CardFlag,
  GameFlags,
  GameState,
  PersistedGameState,
} from "./types";
import { FlagFields, getFlags } from "./validateGameDefinition";

const getCardStats = (
  card: Card,
  flagField: Extract<FlagFields, "no_custom" | "yes_custom">
) => {
  switch (flagField) {
    case "no_custom":
      return [card.no_stat1, card.no_stat2, card.no_stat3, card.no_stat4];
    case "yes_custom":
      return [card.yes_stat1, card.yes_stat2, card.yes_stat3, card.yes_stat4];
  }
};

export const selectAnswer = (
  state: GameState,
  cardFlag: Extract<FlagFields, "no_custom" | "yes_custom">
): PersistedGameState => {
  const cardStats = getCardStats(state.selectedCard!, cardFlag);
  const stats = cardStats.map((cardStatValue, ix) => {
    const currentStat = state.stats[ix];
    if (!cardStatValue) return currentStat;
    const newValue = updateValue(cardStatValue, currentStat);
    return newValue;
  });

  const phase = stats.filter((_, ix) => cardStats[ix]).some((v) => v <= 0)
    ? GamePhase.ENDED
    : GamePhase.STARTED;

  const flags =
    phase === GamePhase.ENDED
      ? {}
      : setFlags(state.flags, getFlags(state.selectedCard!, cardFlag));

  const round = state.round + 1;

  const previouslySelectedCards =
    phase === GamePhase.ENDED
      ? []
      : state.selectedCard
      ? [state.selectedCard, ...state.previouslySelectedCards]
      : state.previouslySelectedCards;

  const selectedCard =
    phase === GamePhase.ENDED
      ? null
      : selectNextCard(
          state.definition,
          flags,
          state.designerCards,
          previouslySelectedCards
        );

  return {
    phase,
    round,
    stats,
    flags,
    selectedCard,
    previouslySelectedCards,
  };
};

export const setFlags = (gameFlags: GameFlags, cardFlags: CardFlag[]) => {
  const flags = { ...gameFlags };
  cardFlags.forEach(({ key, value }) => {
    flags[key] = value;
  });
  return flags;
};

function updateValue(update: number, currentValue: number): number {
  if (!update) {
    return 0;
  }
  let result = currentValue;
  result += update;
  result = Math.min(100, Math.max(0, result));
  return result;
}
