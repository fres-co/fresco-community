import { AnswerTextProps, AnswerText } from "./AnswerText";

export const OptionalAnswerText = ({
  visible,
  ...props
}: { visible: boolean } & AnswerTextProps) => {
  if (!visible) {
    return <div className="answer"></div>;
  }

  return <AnswerText {...props} />;
};
