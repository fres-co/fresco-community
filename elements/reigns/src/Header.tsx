import { Meter } from "./Meter";
import { GameDefinition } from "./features/game/types";

export const Header = ({
  definition,
  stats,
  round,
}: {
  definition: GameDefinition;
  stats: number[];
  round: number;
}) => {
  return (
    <div className="block header">
      <div className="header__side" />
      <div className="meters">
        {definition.stats.map((stat, ix) => (
          <Meter
            key={stat.icon}
            src={stat.icon}
            percent={stats[ix]}
            name={stat.name}
          />
        ))}
      </div>
      <div className="header__side round">
        {definition.roundName} {round}
      </div>
    </div>
  );
};
