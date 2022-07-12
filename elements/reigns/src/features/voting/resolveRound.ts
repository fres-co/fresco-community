import { getSdk } from "../../sdk";
import { Game } from "../game/Game";
import { GameState } from "../game/types";
import {
  GameVote,
  getGameVote,
  PARTICIPANT_VOTE_TABLE,
  persistGameVote,
} from "./persistence";
import { calculateAnswer } from "./calculateAnswer";

export const COUNTDOWN_SECONDS = 5;
export const resolveRound = (gameState: GameState) => {
  const { answer, countdown, everyoneVoted } = collateVotes();

  console.log("Current vote", answer, countdown);

  if (!answer || countdown === null) return;

  const newCount = everyoneVoted && countdown > 0 ? 0 : countdown - 1;
  // let the count go to -1 to allow for teleport time across clients
  if (newCount < -1) {
    persistGameVote(null);
    return;
  } else if (newCount === 0) {
    const game = new Game();
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
    countdown: newCount,
  });

  // persisting of countdown=0 (above) must occur before clearing votes (below)
  // or voteRemoved sound will play

  if (newCount === 0) {
    console.warn("Clearing votes");
    getSdk().storage.realtime.clear(PARTICIPANT_VOTE_TABLE);
  }
};

const collateVotes = (): GameVote & { everyoneVoted: boolean } => {
  const { answer: persistedAnswer, countdown } = getGameVote();
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
