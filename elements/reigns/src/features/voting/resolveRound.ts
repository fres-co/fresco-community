import { Game } from "../game/Game";
import { GameState } from "../game/types";
import {
  clearParticipantVotes,
  GameVote,
  getGameVote,
  persistGameVote,
} from "./persistence";
import { calculateAnswer } from "./calculateAnswer";
import { Countdown } from "../../Countdown";
import { Logger } from "../../Logger";
import { GamePhase } from "../../constants";

export const resolveRound = (gameState: GameState) => {
  const { answer, countdown, everyoneVoted } = collateVotes();

  Logger.logIfDifferent(
    Logger.Keys.RoundVote,
    Logger.VOTE,
    `Round ${gameState.round}, vote: ${answer}, countdown: ${countdown.value}`
  );

  if (!answer || countdown.notStarted) return;

  if (everyoneVoted && countdown.isVoting) {
    countdown.lock();
  } else {
    countdown.decrement();
  }

  // let the count go to -1 to allow for teleport time across clients
  if (countdown.isPastValidRange) {
    persistGameVote(null);
    clearParticipantVotes();
    return;
  }

  if (countdown.wasJustLocked) {
    const game = new Game();

    if (game.retrieve().phase === GamePhase.NOT_STARTED) {
      game.startGame(gameState);
      return;
    }
    switch (answer) {
      case "Yes":
        game.answerYes(gameState);
        break;
      case "No":
        game.answerNo(gameState);
        break;
      default:
        throw new Error("Unknown answer");
    }
  }
  persistGameVote({
    answer,
    countdown: countdown.value,
  });
};

type CollatedVotes = Omit<GameVote, "countdown"> & {
  everyoneVoted: boolean;
  countdown: Countdown;
};
const collateVotes = (): CollatedVotes => {
  const { answer: persistedAnswer, countdown: countdownValue } = getGameVote();
  const countdown = Countdown.from(countdownValue);
  const newAnswer = calculateAnswer();

  if (!newAnswer.answer) {
    if (persistedAnswer) {
      countdown.stop();
      persistGameVote(null);
      return { answer: null, countdown, everyoneVoted: false };
    }
  } else {
    if (!persistedAnswer || persistedAnswer != newAnswer.answer) {
      if (newAnswer.everyoneVoted) {
        countdown.lock();
      } else {
        countdown.start();
      }
      // first tick happens immediately so +1
      countdown.increment();
      return { ...newAnswer, countdown };
    }
  }
  return { ...newAnswer, countdown };
};
