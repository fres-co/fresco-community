import { useTextFit } from "./useTextFit";

export const Message = ({
  message,
  maxFontSize,
}: {
  message: string;
  maxFontSize?: number;
}) => {
  const messageRef = useTextFit(message, maxFontSize);

  return (
    <div className="end">
      <div className="end__message" ref={messageRef} />
    </div>
  );
};
