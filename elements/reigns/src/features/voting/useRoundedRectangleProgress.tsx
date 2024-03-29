import { Application, Graphics, Ticker, utils } from "pixi.js";
import Tween, { Quad } from "gsap";
import { useRef, useEffect, useState } from "react";
import { ANSWER_FILL_ANIMATION_DURATION } from "../../constants";
import { Logger } from "../../Logger";

const duration = 1;
const radius = 20;
const lineWidth = 10;
const margin = lineWidth / 2;
const ease = Quad.easeIn;

export const useRoundedRectangleProgress = (
  progress: number,
  color: string,
  fill: boolean,
  shouldAnimate: boolean
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pixi, setPixi] = useState<Application>();
  const currentProgressRef = useRef<number>(0);
  const currentFillRef = useRef<number>(0);

  useEffect(() => {
    if (pixi) {
      const { perimeter } = getPerimeter(pixi);
      const endPosition = perimeter * progress;

      const progressTween = Tween.to(currentProgressRef, {
        current: endPosition,
        duration: shouldAnimate ? duration : 0,
        ease,
      });

      return () => {
        progressTween.kill();
      };
    }
  }, [progress, pixi, shouldAnimate]);

  useEffect(() => {
    const fillTween = Tween.to(currentFillRef, {
      current: fill ? 100 : 0,
      duration: shouldAnimate ? ANSWER_FILL_ANIMATION_DURATION / 1000 : 0,
      ease,
    });

    return () => {
      fillTween.kill();
    };
  }, [fill, pixi, shouldAnimate]);

  useEffect(() => {
    const app = new Application({
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: ref.current?.parentElement!,
      sharedTicker: true,
    });

    setPixi(app);

    const onTick = () => {
      const g = app.stage.children[0] as Graphics;
      g.clear();
      drawFilledRectangleProgress(app, currentFillRef.current, color);
      drawRoundedRectangleProgress(app, currentProgressRef.current, color);
    };

    Ticker.shared.add(onTick);

    if (ref.current) {
      ref.current.appendChild(app.view);
      app.stage.addChild(new Graphics());
    }

    return () => {
      Ticker.shared.remove(onTick);
      app.destroy(true, true);
    };
  }, []);

  return ref;
};

const drawRoundedRectangleProgress = (
  app: Application,
  current: number,
  color: string
) => {
  const {
    width,
    height,
    topLeftStart,
    top,
    topRight,
    right,
    bottomRight,
    bottom,
    bottomLeft,
    left,
    topLeftEnd,
  } = getPerimeter(app);

  const g = app.stage.children[0] as Graphics;
  g.lineStyle({ color: utils.string2hex(color), width: lineWidth });

  // topLeftStart
  if (current > topLeftStart) {
    g.arc(
      radius + margin,
      radius + margin,
      radius,
      -Math.PI + Math.PI / 4,
      -Math.PI / 2
    );
  } else {
    g.arc(
      radius + margin,
      radius + margin,
      radius,
      -Math.PI + Math.PI / 4,
      -Math.PI + Math.PI / 4 + ((current / topLeftStart) * Math.PI) / 4
    );
    return;
  }

  // top
  if (current > top) {
    g.lineTo(radius + width + margin, margin);
  } else {
    g.lineTo(radius + current + margin, margin);
    return;
  }

  // top right
  if (current > topRight) {
    g.arc(radius + width + margin, radius + margin, radius, -Math.PI / 2, 0);
  } else {
    g.arc(
      radius + width + margin,
      radius + margin,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (current - top) / radius
    );
    return;
  }

  // right
  if (current > right) {
    g.lineTo(radius * 2 + width + margin, radius + height + margin);
  } else {
    g.lineTo(radius * 2 + width + margin, radius + margin + current - topRight);
    return;
  }

  // bottomRight
  if (current > bottomRight) {
    g.arc(
      radius + width + margin,
      radius + height + margin,
      radius,
      0,
      Math.PI / 2
    );
  } else {
    g.arc(
      radius + width + margin,
      radius + height + margin,
      radius,
      0,
      (current - right) / radius
    );
    return;
  }

  // bottom
  if (current > bottom) {
    g.lineTo(margin + radius, radius * 2 + margin + height);
  } else {
    g.lineTo(
      margin + radius + width - (current - bottomRight),
      radius * 2 + margin + height
    );
    return;
  }

  // bottomLeft
  if (current > bottomLeft) {
    g.arc(
      margin + radius,
      radius + height + margin,
      radius,
      Math.PI / 2,
      Math.PI
    );
  } else {
    g.arc(
      margin + radius,
      radius + height + margin,
      radius,
      Math.PI / 2,
      Math.PI / 2 + (current - bottom) / radius
    );
    return;
  }

  // left
  if (current > left) {
    g.lineTo(margin, margin + radius);
  } else {
    g.lineTo(margin, margin + radius + height - (current - bottomLeft));
    return;
  }

  // topLeftEnd
  if (current >= topLeftEnd) {
    g.arc(
      radius + margin,
      radius + margin,
      radius,
      -Math.PI,
      -Math.PI + Math.PI / 4
    );
  } else {
    g.arc(
      radius + margin,
      radius + margin,
      radius,
      -Math.PI,
      -Math.PI + Math.PI / 4
    );
    -Math.PI + ((current - left / topLeftStart) * Math.PI) / 4;
    return;
  }
};
const getPerimeter = (app: Application) => {
  try {
    const width = app.screen.width - 2 * radius - 2 * margin;
    const height = app.screen.height - 2 * radius - 2 * margin;

    const topLeftStart = (Math.PI / 4) * radius;
    const top = topLeftStart + width;
    const topRight = top + (Math.PI / 2) * radius;
    const right = topRight + height;
    const bottomRight = right + (Math.PI / 2) * radius;
    const bottom = bottomRight + width;
    const bottomLeft = bottom + (Math.PI / 2) * radius;
    const left = bottomLeft + height;
    const topLeftEnd = left + (Math.PI / 4) * radius;
    const perimeter = left;
    return {
      width,
      height,
      topLeftStart,
      top,
      topRight,
      right,
      bottomRight,
      bottom,
      bottomLeft,
      left,
      topLeftEnd,
      perimeter,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const drawFilledRectangleProgress = (
  app: Application,
  current: number,
  color: string
) => {
  const g = app.stage.children[0] as Graphics;

  const ratio = 1.1 - (current / 100) * 1.2;
  const height = app.screen.height;
  const width = app.screen.width;

  g.lineStyle({ color: utils.string2hex(color), width: 0 });

  g.moveTo(width, height * ratio);
  g.beginFill(utils.string2hex(color));
  g.bezierCurveTo(
    0.647 * width,
    -0.32 * height + height * ratio,
    0.374 * width,
    0.32 * height + height * ratio,
    0,
    height * ratio
  );
  g.lineTo(0, height * 1.1);
  g.lineTo(width, height * 1.1);
  g.lineTo(width, height * ratio);
  g.endFill();
};
