import clsx from "clsx";
import { useSelector } from "react-redux";
import { useRoundedRectangleProgress } from "./features/voting/useRoundedRectangleProgress";
import { AppState } from "./store";
import { useTextFit } from "./useTextFit";

const VOTES_MISSING_SUFFIX = "missing until majority";
const getVotesMissingMessage = (votesMissing: number) => {
  if (votesMissing === 1) return `1 vote ${VOTES_MISSING_SUFFIX}`;
  return `${votesMissing} votes ${VOTES_MISSING_SUFFIX}`;
};

export type AnswerTextProps = {
  text: string;
  answer: "yes" | "no";
  progress: number;
  color: string;
  votesMissing: number | null;
};

export const AnswerText = ({
  text,
  answer,
  progress,
  votesMissing,
  color,
}: AnswerTextProps) => {
  const isChangingQuestion = useSelector(
    (state: AppState) => state.transition.question
  );
  const isChangingRound = useSelector(
    (state: AppState) => state.transition.round
  );

  const backgroundRef = useRoundedRectangleProgress(
    progress,
    color,
    isChangingRound && progress >= 1,
    !isChangingQuestion
  );

  const textRef = useTextFit(text, window.innerHeight * 0.04);
  const fadeAnswer = useSelector((state: AppState) => state.transition.answer);

  return (
    <div className="answer">
      <div className="answer__text-outer-container">
        <div className="answer__text-inner-container">
          <div
            ref={backgroundRef}
            id={`${answer}-answer-background`}
            className={clsx("answer__text-background fade", {
              "fade--in": !fadeAnswer,
            })}
          >
            <div className="answer__text-wrapper">
              <div ref={textRef} className="answer__text"></div>
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "answer__votes-missing fade",
            !fadeAnswer && "fade--in"
          )}
          data-testid={`${answer}-votes-missing`}
        >
          {!!votesMissing && votesMissing < 4 && (
            <span>{getVotesMissingMessage(votesMissing)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
