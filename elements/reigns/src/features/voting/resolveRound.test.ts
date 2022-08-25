import { getSdk } from "../../sdk";
import { mockSdk } from "../../mocks";
import { PARTICIPANT_INSIDE_TABLE } from "./useOnFrescoStateUpdate";
import { resolveRound } from "./resolveRound";
import { createGameStartedState, createGameState } from "../game/objectMother";
import * as persistence from "./persistence";
const {
  persistParticipantVote,
  getGameVote,
  persistGameVote,
  PARTICIPANT_VOTE_TABLE,
} = persistence;
import { Countdown } from "../../Countdown";
import * as selectNextCard from "../game/selectNextCard";
import { getParticipantVotes } from "./persistence";

type OptionalAnswer = persistence.Answer | null;
const vote = (
  localParticipantVote: OptionalAnswer,
  remote1Vote: OptionalAnswer,
  remote2Vote: OptionalAnswer
) => {
  persistParticipantVote(getSdk().localParticipant.id, localParticipantVote);
  persistParticipantVote("remote1", remote1Vote);
  persistParticipantVote("remote2", remote2Vote);
};

describe("resolveRound", () => {
  let sdk: IFrescoSdk;
  beforeEach(() => {
    jest.clearAllMocks();
    mockSdk({
      remoteParticipants: [
        { id: "remote1", name: "remote participant 1" } as Participant,
        { id: "remote2", name: "remote participant 2" } as Participant,
      ],
    });
    sdk = getSdk();
    // put participants inside the element
    [sdk.localParticipant.id, "remote1", "remote2"].forEach((id) => {
      sdk.storage.realtime.set(PARTICIPANT_INSIDE_TABLE, id, true);
    });
  });

  describe("when enough votes to reach majority", () => {
    it("should apply vote instantly if everyone voted ", () => {
      vote("Yes", "Yes", "No");

      resolveRound(createGameStartedState());

      const { answer, countdown } = getGameVote();
      expect(answer).toBe("Yes");
      expect(Countdown.from(countdown).wasJustLocked).toBe(true);
    });

    it("should start countdown if not everyone voted", () => {
      vote("Yes", "Yes", null);

      resolveRound(createGameStartedState());

      const { answer, countdown } = getGameVote();
      expect(answer).toBe("Yes");
      expect(Countdown.from(countdown).isStarted).toBe(true);
    });

    it("should apply vote instantly if everyone voted and countdown already started", () => {
      vote("Yes", "Yes", null);

      resolveRound(createGameStartedState());
      persistParticipantVote("remote2", "Yes");
      resolveRound(createGameStartedState());

      const { answer, countdown } = getGameVote();
      expect(answer).toBe("Yes");
      expect(Countdown.from(countdown).wasJustLocked).toBe(true);
    });

    it("should clear participant votes after countdown === -1", () => {
      vote("Yes", "Yes", "No");

      resolveRound(createGameStartedState());
      expect(getGameVote().countdown).toBe(0);
      resolveRound(createGameStartedState());
      expect(getGameVote().countdown).toBe(-1);
      resolveRound(createGameStartedState());

      expect(sdk.storage.realtime.all(PARTICIPANT_VOTE_TABLE)).toEqual({});
    });

    it("should start countdown", () => {
      vote("Yes", "Yes", null);

      resolveRound(createGameStartedState());

      const { countdown } = getGameVote();
      expect(Countdown.from(countdown).isStarted).toBe(true);
    });

    describe("when player removes vote", () => {
      beforeEach(() => {
        // majority voted
        vote("Yes", "Yes", null);
        resolveRound(createGameStartedState());
        // remove vote
        vote("Yes", null, null);
      });

      it("should stop countdown", () => {
        resolveRound(createGameStartedState());

        const { countdown: newCountdown } = getGameVote();
        expect(Countdown.from(newCountdown).isStarted).toBe(false);
      });
      it("should not clear other player votes", () => {
        resolveRound(createGameStartedState());

        expect(getParticipantVotes()).toStrictEqual(
          expect.arrayContaining([expect.objectContaining({ answer: "Yes" })])
        );
      });
    });

    it("should force reset if countdown gets too low", () => {
      vote("Yes", "Yes", null);

      persistGameVote({ answer: "Yes", countdown: -43 });
      resolveRound(createGameStartedState());
      const { answer, countdown } = getGameVote();
      expect(answer).toBeUndefined();
      expect(countdown).toBeUndefined();
    });

    it("should select a new card once at end of round", () => {
      const spy = jest.spyOn(selectNextCard, "selectNextCard");

      vote("Yes", "Yes", "Yes");
      persistGameVote({ answer: "Yes", countdown: 1 });

      resolveRound(createGameStartedState()); //  0
      resolveRound(createGameStartedState()); // -1
      resolveRound(createGameStartedState()); // -2

      expect(spy).toBeCalledTimes(1);
    });

    it("should clear participant votes once per round", () => {
      const spy = jest.spyOn(persistence, "clearParticipantVotes");

      vote("Yes", "Yes", "Yes");
      persistGameVote({ answer: "Yes", countdown: 1 });

      resolveRound(createGameState()); //  0
      resolveRound(createGameState()); // -1
      resolveRound(createGameState()); // -2

      expect(spy).toBeCalledTimes(1);
    });
  });
});
