import { GamePhase, Loading } from "../../constants";

export type Stat = {
  value: number;
  icon: string;
  name: string;
};

export type CardFlag = {
  key: string;
  value: string;
};

export type Card = {
  card: string;
  bearer: string;
  weight: number;

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

export type GameDefinition = {
  cards: Card[];
  stats: Stat[];
  assetsUrl: string;
  deathMessage: string;
  roundName: string;
};

export type GameFlags = { [key: string]: string };

export type Configuration = {
  gameUrl: string;
  designerCardsCsv?: string;
  designerCards?: Card[];
};

export type PersistedGameState = {
  phase: GamePhase;
  selectedCard: Card | null;
  stats: number[];
  round: number;
  flags: GameFlags;
};

export type PersistedState = Configuration & PersistedGameState;

export type GameState = Omit<PersistedState, "gameUrl"> & {
  loading: Loading;
  gameUrl: string | null;
  definition: GameDefinition | null;
};
