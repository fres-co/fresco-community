import { AppState } from "../../store";
import { getSdk } from "../../sdk";
import { PARTICIPANT_VOTE_TABLE } from "../voting/useVoteListener";
import { detectGameChange } from "./gameChangeListener";
import { mockSdk } from "./mocks";
import { createGameState } from "./objectMother";
import { setHost } from "../host/persistence";
import { HostState } from "../host/hostSlice";

describe("gameChangeListener", () => {
  beforeEach(() => {
    mockSdk(undefined, {
      [PARTICIPANT_VOTE_TABLE]: {
        ["some-participant"]: "Yes",
      },
    });
  });
  describe("detectGameChange", () => {
    it("should not clear votes not host", () => {
      const otherHost = {
        id: "someone-else",
        name: "whatever",
      };
      setHost(otherHost);
      detectGameChange(
        {
          game: createGameState(undefined, { gameUrl: "original-url" }),
          host: {
            currentHost: otherHost,
          } as HostState,
        } as AppState,
        "new-url"
      );

      const votes = Object.keys(
        getSdk().storage.realtime.all(PARTICIPANT_VOTE_TABLE)
      );
      expect(votes).not.toHaveLength(0);
    });
    it("should not clear votes if initializing", () => {
      const localParticipant = getSdk().localParticipant as Participant;
      setHost(localParticipant);

      detectGameChange(
        {
          game: createGameState(undefined, { gameUrl: null }),
          host: {
            currentHost: localParticipant,
          } as HostState,
        } as AppState,
        "new-url"
      );

      const votes = Object.keys(
        getSdk().storage.realtime.all(PARTICIPANT_VOTE_TABLE)
      );
      expect(votes).not.toHaveLength(0);
    });

    it("should clear votes if game is changed", () => {
      const localParticipant = getSdk().localParticipant as Participant;
      setHost(localParticipant);

      detectGameChange(
        {
          game: createGameState(undefined, { gameUrl: "old-url" }),
          host: {
            currentHost: localParticipant,
          } as HostState,
        } as AppState,
        "new-url"
      );

      const votes = Object.keys(
        getSdk().storage.realtime.all(PARTICIPANT_VOTE_TABLE)
      );
      expect(votes).toHaveLength(0);
    });
  });
});
