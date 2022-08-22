import { Meter } from "./Meter";
import { GameDefinition } from "./features/game/types";
import { GamePhase } from "./constants";

export const Header = ({
  definition,
  stats,
  round,
  phase
}: {
  definition: GameDefinition;
  stats: number[];
  round: number;
  phase: GamePhase
}) => {

  if(round === 0){
    return null
  }
  return (
    <div className="block header">
      <div className="meters">
        {round !== 0 &&
          definition.stats.map((stat, ix) => (
            <Meter
              key={stat.icon}
              src={stat.icon}
              percent={stats[ix]}
              name={stat.name}
              phase={phase}
            />
          ))}
      </div>
    </div>
  );
};
