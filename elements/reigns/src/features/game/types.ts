import { GamePhase, Loading } from "../../constants";

export type Stat = {
  value: number;
  icon: string;
  name: string;
  deathMessage?: string;
};

export type CardFlag = {
  key: string;
  value: string;
  operator:
    | ((a: string, b: string) => boolean)
    | ((a: number, b: number) => boolean);
};

export type Card = {
  card: string;
  id: string;
  bearer: string;
  weight: number;
  cooldown?: number;

  answer_yes: string;
  yes_stat1: number;
  yes_stat2: number;
  yes_stat3: number;
  yes_stat4: number;
  yes_custom: string;

  answer_no: string;
  no_stat1: number;
  no_stat2: number;
  no_stat3: number;
  no_stat4: number;
  no_custom: string;

  conditions: string;
};

// a Card that has no impact, weight or stats, that is used by the game as menu screen (start, restart)
export type MenuCard = Pick<Card, "card" | "answer_yes" | "answer_no"> & {
  id: GamePhase.ENDED | GamePhase.NOT_STARTED;
};

export function isMenuCard(card: Card | MenuCard): card is MenuCard {
  return card.id === GamePhase.ENDED || card.id === GamePhase.NOT_STARTED;
}

export type GameDefinition = {
  cards: Card[];
  stats: Stat[];
  assetsUrl: string;
  deathMessage: string;
  victoryMessage: string;
  victoryRoundThreshold: number;
  roundName: string;
  gameName: string;
};

export type GameFlags = { [key: string]: string };

export type Configuration = {
  gameUrl: string;
  designerCardsCsv?: string;
  designerCards?: Card[];
};

export type PersistedGameState = {
  phase: GamePhase;
  selectedCard: Card | MenuCard | null;
  stats: number[];
  round: number;
  flags: GameFlags;
  previouslySelectedCardIds: string[]; // array sorted in the reverse order, recently viewed card have the lowest index
};

export type PersistedState = Configuration & PersistedGameState;

export type GameState = Omit<PersistedState, "gameUrl"> & {
  loading: Loading;
  gameUrl: string | null;
  definition: GameDefinition | null;
};
