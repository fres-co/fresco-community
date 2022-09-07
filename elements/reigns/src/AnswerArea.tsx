import { mockSdkVote } from "./mockSdkVote";

export const AnswerArea = ({
  answer,
  visible,
}: {
  answer: "yes" | "no";
  visible: boolean;
}) => {
  return (
    <div className="answer">
      {visible && (
        <div
          className={`answer__zone answer--${answer}`}
          onClick={() => mockSdkVote(answer)}
        ></div>
      )}
    </div>
  );
};
