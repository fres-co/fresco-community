import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MeterArrow } from "./MeterArrow";
import { AppState } from "./store";

export const Meter = ({
  src,
  percent,
  name,
}: {
  src: string;
  percent: number;
  name: string;
}) => {
  const assetsUrl = useSelector(
    (state: AppState) => state.game.definition?.assetsUrl
  );

  const [currentAnimation, setCurrentAnimation] = useState("");
  const previousPercent = useRef(0);

  useEffect(() => {
    if (percent == undefined || previousPercent.current === undefined) {
      if (percent !== undefined) {
        previousPercent.current = percent;
      }
      return;
    }
    const isBig = Math.abs(percent - previousPercent.current) > 5;
    // Whenever percent changes, we want to add a class
    // to the meter element to make it change color
    if (percent > previousPercent.current) {
      setCurrentAnimation(`meter__progress--grow${isBig ? "--big" : ""}`);
    } else {
      setCurrentAnimation(`meter__progress--shrink${isBig ? "--big" : ""}`);
    }

    const timeout = setTimeout(() => {
      setCurrentAnimation("");
      // css animation is .5s
      // we wait 1s so that the color lingers a bit longer
    }, 3000);

    previousPercent.current = percent;
    return () => clearTimeout(timeout);
  }, [percent]);

  return (
    <div className={"meter"}>
      <div className="meter__label">
        <img src={`${assetsUrl}/${src}`} />
        <div className="meter__name" title={name}>
          {name}
        </div>
      </div>
      <div
        className={clsx(
          "meter__progress",
          currentAnimation,
          percent <= 0 && "red-glow"
        )}
      >
        <div className="meter__percent" style={{ width: percent + "%" }} />
      </div>
      <MeterArrow
        className="meter__arrow"
        currentAnimation={currentAnimation}
      />
    </div>
  );
};
