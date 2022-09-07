import { GameDefinition } from "./features/game/types";

export function RoundLabel({ round, gameDefinition }: { round: number; gameDefinition: GameDefinition; }) {
  if (round === 0)
    return null;
  const roundText = `${gameDefinition.roundName} ${round}`;
  if (!gameDefinition.victoryRoundThreshold) {
    return <span className='round-label'>{roundText}</span>
  }

  return <span className='round-label'>{roundText}<span className='round-label-threshold'> / {gameDefinition.victoryRoundThreshold}</span></span>;
}