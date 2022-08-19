import { CONDITION_KEY_VALUE_SEPARATORS, getOperator } from "./compare";
import { getRootAssetsUrl } from "./gameDefinitionUtils";
import { mapCardWithIndex } from "./parseCardsFromCsv";
import { STAT_FLAG_NAME_REGEXP } from "./selectNextCard";
import { Card, CardFlag, GameDefinition } from "./types";

const getDefinitionWithDefault = (gameDefinition: GameDefinition) => {
  const defaultGameDefiniton = {
    assetsUrl: "",
    roundName: "",
    gameName: "",
    deathMessage: "",
    victoryMessage: "",
    victoryRoundThreshold: 0,
  } as GameDefinition;

  return (
    Object.keys(defaultGameDefiniton) as unknown as (keyof GameDefinition)[]
  ).reduce(
    (memo: GameDefinition, key: keyof GameDefinition) => {
      if (memo[key] === undefined || memo[key] === null) {
        (memo[key] as any) = defaultGameDefiniton[key];
      }
      return memo;
    },
    { ...gameDefinition }
  );
};

export const validateGameDefinition = (
  definition: GameDefinition
): GameDefinition => {
  const cardsWithIds = definition.cards.map(mapCardWithIndex);

  const definitionWithDefault = getDefinitionWithDefault(definition);
  return Object.freeze({
    ...definitionWithDefault,
    assetsUrl: getRootAssetsUrl(definition.assetsUrl),
    cards: validateCards(cardsWithIds),
  });
};

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

    if (card.cooldown !== null && card.cooldown !== undefined) {
      if (!Number.isInteger(card.cooldown)) {
        throw new Error(
          `Card ${i + 1} is invalid, cooldown must be an interger`
        );
      }

      if (card.cooldown < 0) {
        throw new Error(
          `Card ${i + 1} is invalid, cooldown must be positve or equal to 0`
        );
      }
    }

    if (!card.answer_no && !card.answer_yes) {
      throw new Error(`Card ${i + 1} is invalid. At least one answer must be supplied`)
    }

    validateFlags(getFlags(card, "yes_custom"), "yes_custom", i + 1);
    validateFlags(getFlags(card, "no_custom"), "no_custom", i + 1);

    validateConditions(getConditions(card), "conditions", i + 1);
  }

  return cards;
};

const FLAG_SEPARATOR = " ";
const FLAG_KEY_VALUE_SEPARATOR = "=";

export type FlagFields = keyof Pick<
  Card,
  "yes_custom" | "no_custom" | "conditions"
>;

export const throwOnDuplicateKey = (
  flags: CardFlag[],
  field: FlagFields,
  cardNumber: number
) => {
  if ([...new Set(flags.map((flag) => flag.key))].length !== flags.length) {
    throw new Error(`Card ${cardNumber} has duplicate flag in ${field}`);
  }
};

export const validateFlags = (
  flags: CardFlag[],
  field: FlagFields,
  cardNumber: number
) => {
  const allowedValues = ["true", "false"];
  flags.forEach((flag) => {
    const statMatch = flag.key.match(STAT_FLAG_NAME_REGEXP);
    if (statMatch) {
      throw new Error(
        `Card ${cardNumber} has invalid flags ${field}, name cannot be a stat`
      );
    } else if (!allowedValues.includes(flag.value)) {
      throw new Error(
        `Card ${cardNumber} has invalid ${field}, value must be ${allowedValues.join(
          " or "
        )}, but found ${flag.value}`
      );
    }
  });
  throwOnDuplicateKey(flags, field, cardNumber);
};

export const validateConditions = (
  flags: CardFlag[],
  field: FlagFields,
  cardNumber: number
) => {
  const allowedValues = ["true", "false"];
  flags.forEach((flag) => {
    const statMatch = flag.key.match(STAT_FLAG_NAME_REGEXP);
    if (statMatch) {
      if (flag.value !== `${Number(flag.value)}`) {
        throw new Error(
          `Card ${cardNumber} has invalid stat ${field}, value must be an integer`
        );
      }
    } else if (!allowedValues.includes(flag.value)) {
      throw new Error(
        `Card ${cardNumber} has invalid ${field}, value must be ${allowedValues.join(
          " or "
        )}, but found ${flag.value}`
      );
    }
  });
  throwOnDuplicateKey(flags, field, cardNumber);
};

const CONDITION_REGEXP =
  /^(?<key>[A-Za-z0-9_\-]+)(((?<number_operator>==|>=|>|!=|<|<=)(?<number_value>\d+))|(?<boolean_operator>==)(?<boolean_value>true|false))$/;
export const parseCondition = (condition: string) => {
  const matchArray = condition.match(CONDITION_REGEXP);
  if (!matchArray || !matchArray.groups) {
    throw new Error(`Conditions ${condition} does not match the valid syntax`);
  }

  return {
    key: matchArray.groups.key,
    value: matchArray.groups.number_value || matchArray.groups.boolean_value,
    separator:
      matchArray.groups.number_operator || matchArray.groups.boolean_operator,
  };
};

export const getConditions = (card: Card) => {
  if (!card.conditions) {
    return [] as CardFlag[];
  }

  return card.conditions.split(FLAG_SEPARATOR).map((condition) => {
    const parsedCondition = parseCondition(condition);

    return {
      key: parsedCondition.key,
      value: parsedCondition.value,
      operator: getOperator(
        parsedCondition.separator as CONDITION_KEY_VALUE_SEPARATORS
      ),
    } as CardFlag;
  });
};

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
    return {
      key,
      value,
      operator: getOperator(
        keyValueSeparator as CONDITION_KEY_VALUE_SEPARATORS
      ),
    };
  });
};
