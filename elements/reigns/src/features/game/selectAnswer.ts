import {
  GamePhase,
  VICTORY_FLAG_NAME,
  VICTORY_FLAG_VALUE,
} from "../../constants";
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

  const nextPhase = stats.filter((_, ix) => cardStats[ix]).some((v) => v <= 0)
    ? GamePhase.ENDED
    : GamePhase.STARTED;

  const flags = setFlags(state.flags, getFlags(state.selectedCard!, cardFlag));
  const round = state.round + 1;

  const victoryRoundThreshold = state.definition?.victoryRoundThreshold ?? 0;
  if (
    nextPhase === GamePhase.STARTED &&
    victoryRoundThreshold > 0 &&
    round >= victoryRoundThreshold
  ) {
    flags[VICTORY_FLAG_NAME] = VICTORY_FLAG_VALUE;
  }

  const phase =
    flags[VICTORY_FLAG_NAME] === VICTORY_FLAG_VALUE
      ? GamePhase.ENDED
      : nextPhase;

  const previouslySelectedCardIds =
    phase === GamePhase.ENDED
      ? []
      : state.selectedCard
      ? [state.selectedCard.id, ...state.previouslySelectedCardIds]
      : state.previouslySelectedCardIds;

  const selectedCard =
    phase === GamePhase.ENDED
      ? null
      : selectNextCard(
          state.definition,
          flags,
          state.designerCards,
          stats,
          previouslySelectedCardIds
        );

  return {
    phase,
    round,
    stats,
    flags,
    selectedCard,
    previouslySelectedCardIds,
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
