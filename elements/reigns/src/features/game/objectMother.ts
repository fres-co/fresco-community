import { initialState } from "./gameSlice";
import { Card, GameDefinition, GameState } from "./types";

export const createGameState = (
  definition = createGameDefinition(),
  stateOverride: Partial<Omit<GameState, "definition">> = {
    ...initialState,
    selectedCard: createCard(),
  }
) =>
  ({
    ...initialState,
    selectedCard: createCard(),
    ...stateOverride,
    definition,
  } as GameState);

export const createCard = (cardOverride: Partial<Card> = {}): Card => ({
  card: "my card",
  bearer: "some text",
  weight: 1,
  answer_yes: "Yes!",
  yes_stat1: 0,
  yes_stat2: 0,
  yes_stat3: 0,
  yes_stat4: 0,
  yes_custom: "",
  answer_no: "No!",
  no_stat1: 0,
  no_stat2: 0,
  no_stat3: 0,
  no_stat4: 0,
  no_custom: "",
  conditions: "",
  ...cardOverride,
});

export const createGameDefinition = (
  override: Partial<GameDefinition> = {}
): GameDefinition => ({
  cards: [createCard()],
  stats: [
    {
      name: "my stat",
      icon: "some icon",
      value: 5,
    },
  ],
  roundName: 'Day',
  gameName: 'My Game',
  assetsUrl: "whatever",
  deathMessage: "You died",
  ...override,
});
