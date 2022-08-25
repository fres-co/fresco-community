import { Countdown } from "./Countdown";
import { AppState } from "./store";
import { useSelector } from "react-redux";

export const useVotes = () => {
  const countdown = Countdown.from(
    useSelector((state: AppState) => state.voting.countdown)
  );

  const yesProgress = useSelector((state: AppState) =>
    state.voting.answer === "Yes" &&
    Countdown.from(state.voting.countdown).isLocked
      ? 1
      : state.voting.yesProgress
  );
  const noProgress = useSelector((state: AppState) =>
    state.voting.answer === "No" &&
    Countdown.from(state.voting.countdown).isLocked
      ? 1
      : state.voting.noProgress
  );
  const yesVotesMissing = useSelector(
    (state: AppState) => state.voting.yesVotesMissing
  );
  const noVotesMissing = useSelector(
    (state: AppState) => state.voting.noVotesMissing
  );

  const selectedCard = useSelector(
    (state: AppState) => state.game.selectedCard
  );

  return {
    countdown,
    yesProgress,
    noProgress,
    yesVotesMissing,
    noVotesMissing,
    selectedCard,
  };
};
