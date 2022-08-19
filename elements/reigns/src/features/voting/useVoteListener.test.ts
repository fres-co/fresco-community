import { renderHook } from "@testing-library/react";
import { GamePhase } from "../../constants";
import { mockSdk } from "../../mocks";
import { useVoteListener } from "./useVoteListener";
import { Game } from "../game/Game";
import { PersistedGameState, Card } from "../game/types";

describe("use vote listener", () => {
  const subscribeToGlobalEvent = jest.fn().mockReturnValue(jest.fn());
  const triggerEvent = jest.fn();
  beforeEach(() => {
    mockSdk({ subscribeToGlobalEvent, triggerEvent });
    jest.clearAllMocks();
  });
  describe("when phase is started", () => {
    it("subscribes to custom.reign.yes", () => {
      renderHook(() => useVoteListener(GamePhase.STARTED));

      expect(subscribeToGlobalEvent).toHaveBeenCalledWith(
        "custom.reign.yes",
        expect.any(Function)
      );
    });
    it("subscribes to custom.reign.no", () => {
      renderHook(() => useVoteListener(GamePhase.STARTED));

      expect(subscribeToGlobalEvent).toHaveBeenCalledWith(
        "custom.reign.no",
        expect.any(Function)
      );
    });
    it("subscribes to custom.reign.remove-vote", () => {
      renderHook(() => useVoteListener(GamePhase.STARTED));

      expect(subscribeToGlobalEvent).toHaveBeenCalledWith(
        "custom.reign.remove-vote",
        expect.any(Function)
      );
    });

    describe("when receiving custom.reign.yes", () => {
      describe("when current card has an answer_yes value", () => {
        it("triggers custom.reign.local_yes event", () => {
          jest.spyOn(Game.prototype, "retrieve").mockImplementation(
            () =>
              ({
                selectedCard: {
                  card: "card",
                  answer_yes: "yes !",
                } as Card,
              } as PersistedGameState)
          );

          renderHook(() => useVoteListener(GamePhase.STARTED));
          const listener = subscribeToGlobalEvent.mock.calls.find(
            (call) => call[0] === "custom.reign.yes"
          )[1];
          listener();

          expect(triggerEvent).toBeCalledWith({
            eventName: "custom.reign.local_yes",
          });
        });
      });

      describe("when current card has no answer_yes value", () => {
        it("does not trigger custom.reign.local_yes event", () => {
          jest.spyOn(Game.prototype, "retrieve").mockImplementation(
            () =>
              ({
                selectedCard: {
                  card: "card",
                } as Card,
              } as PersistedGameState)
          );
          renderHook(() => useVoteListener(GamePhase.STARTED));
          const listener = subscribeToGlobalEvent.mock.calls.find(
            (call) => call[0] === "custom.reign.yes"
          )[1];
          listener();

          expect(triggerEvent).not.toBeCalledWith("custom.reign.local_yes");
        });
      });
    });

    describe("when receiving custom.reign.no", () => {
      describe("when current card has an answer_no value", () => {
        it("triggers custom.reign.no event", () => {
          jest.spyOn(Game.prototype, "retrieve").mockImplementation(
            () =>
              ({
                selectedCard: {
                  card: "card",
                  answer_no: "no !",
                } as Card,
              } as PersistedGameState)
          );

          renderHook(() => useVoteListener(GamePhase.STARTED));
          const listener = subscribeToGlobalEvent.mock.calls.find(
            (call) => call[0] === "custom.reign.no"
          )[1];
          listener();

          expect(triggerEvent).toBeCalledWith({
            eventName: "custom.reign.local_no",
          });
        });
      });

      describe("when current card has no answer_no value", () => {
        it("does not trigger custom.reign.local_no event", () => {
          jest.spyOn(Game.prototype, "retrieve").mockImplementation(
            () =>
              ({
                selectedCard: {
                  card: "card",
                } as Card,
              } as PersistedGameState)
          );
          renderHook(() => useVoteListener(GamePhase.STARTED));
          const listener = subscribeToGlobalEvent.mock.calls.find(
            (call) => call[0] === "custom.reign.no"
          )[1];
          listener();

          expect(triggerEvent).not.toBeCalledWith("custom.reign.local_no");
        });
      });
    });
  });

  describe("when phase is NOT_STARTED", () => {
    it("does not subscribe to event", () => {
      renderHook(() => useVoteListener(GamePhase.NOT_STARTED));

      expect(subscribeToGlobalEvent).not.toHaveBeenCalled();
    });
  });
});
