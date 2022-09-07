import { Meter } from "./Meter";
import { GameDefinition } from "./features/game/types";
import { GamePhase } from "./constants";
import { RoundLabel } from "./RoundLabel";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { AppState } from "./store";
import { shouldHideResources } from "./features/game/selectors";

export const Header = ({
  definition,
  stats,
  round,
  phase,
}: {
  definition: GameDefinition;
  stats: number[];
  round: number;
  phase: GamePhase;
}) => {
  if (round === 0) {
    return null;
  }

  const isHidden = useSelector(shouldHideResources);

  return (
    <div
      className={clsx("block", "header", { hidden: isHidden })}
      data-testid="header"
    >
      <div className="round">
        <RoundLabel round={round} gameDefinition={definition} />
      </div>
      <div className="meters">
        {definition.stats.map((stat, ix) => (
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
