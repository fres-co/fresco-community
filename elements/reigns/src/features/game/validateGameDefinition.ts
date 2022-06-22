import { getRootAssetsUrl } from "./gameDefinitionUtils";
import { Card, CardFlag, GameDefinition } from "./types";

export const validateGameDefinition = (
  definition: GameDefinition
): GameDefinition => ({
  ...definition,
  assetsUrl: getRootAssetsUrl(definition.assetsUrl),
  ...validateCards(definition.cards),
});

export const urlWithoutTrailingSlash = (url: string) => {
  if (!url) return "";

  if (url.slice(-1) !== "/") {
    return url;
  }

  return url.slice(0, -1);
};

export const validateCards = (cards: Card[] | undefined): Card[] => {
  const cardIds = new Set<string>();
  if (!cards || cards.length === 0) {
    throw new Error("No cards found");
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card.card) {
      throw new Error(`Card ${i + 1} is invalid`);
    }
    if (cardIds.has(card.id)) {
      throw new Error(`Card ${i + 1} has a duplicated id`);
    }
    cardIds.add(card.id);
    if (!card.weight || card.weight < 0) {
      throw new Error(
        `Card ${i + 1} is invalid, weight must be greater than 0`
      );
    }
    if (card.weight > 100) {
      throw new Error(`Card ${i + 1} is invalid, weight must be less than 100`);
    }

    validateFlags(getFlags(card, "yes_custom"), "yes_custom", i + 1);
    validateFlags(getFlags(card, "no_custom"), "no_custom", i + 1);
    validateFlags(getConditions(card), "conditions", i + 1);
  }

  return cards;
};

const FLAG_SEPARATOR = " ";
const FLAG_KEY_VALUE_SEPARATOR = "=";
const CONDITION_KEY_VALUE_SEPARATOR = "==";

export type FlagFields = keyof Pick<
  Card,
  "yes_custom" | "no_custom" | "conditions"
>;

export const validateFlags = (
  flags: CardFlag[],
  field: FlagFields,
  cardNumber: number
) => {
  const allowedValues = ["true", "false"];
  flags.forEach((flag) => {
    if (!allowedValues.includes(flag.value)) {
      throw new Error(
        `Card ${cardNumber} has invalid ${field}, value must be ${allowedValues.join(
          " or "
        )}, but found ${flag.value}`
      );
    }
  });
  if ([...new Set(flags.map((flag) => flag.key))].length !== flags.length) {
    throw new Error(`Card ${cardNumber} has duplicate flag in ${field}`);
  }
};

export const getConditions = (card: Card) =>
  getKeyValues(card, "conditions", CONDITION_KEY_VALUE_SEPARATOR);

export const getFlags = (
  card: Card,
  field: Extract<FlagFields, "no_custom" | "yes_custom">
) => getKeyValues(card, field, FLAG_KEY_VALUE_SEPARATOR);

const getKeyValues = (
  card: Card,
  field: FlagFields,
  keyValueSeparator: string
): CardFlag[] => {
  if (!card[field]) {
    return [];
  }

  return card[field].split(FLAG_SEPARATOR).map((flag) => {
    const [key, value] = flag.split(keyValueSeparator);
    return { key, value };
  });
};
