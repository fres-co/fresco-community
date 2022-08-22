import { useEffect } from "react";
import { GamePhase } from "../../constants";
import { Logger } from "../../Logger";
import { getSdk } from "../../sdk";
import { Game } from "../game/Game";
import { persistParticipantVote } from "./persistence";

export const useVoteListener = (phase: GamePhase) => {
  useEffect(() => {
    console.log("useVoteListener pahse", phase);
    if (phase === GamePhase.STARTED || phase === GamePhase.NOT_STARTED || phase === GamePhase.ENDED) {
      const sdk = getSdk();
      const yesListener = sdk.subscribeToGlobalEvent("custom.reign.yes", () => {
        const game = new Game().retrieve();
        const canVoteYes =
          (game.phase === GamePhase.STARTED && game.selectedCard?.answer_yes) ||
          game.phase === GamePhase.NOT_STARTED || 
          game.phase === GamePhase.ENDED;

        if (canVoteYes) {
          Logger.log(Logger.VOTE, "vote yes");
          persistParticipantVote(sdk.localParticipant.id, "Yes");
          sdk.triggerEvent({ eventName: "custom.reign.local_yes" });
        }
      });

      const noListener = sdk.subscribeToGlobalEvent("custom.reign.no", () => {
        if (new Game().retrieve().selectedCard?.answer_no) {
          Logger.log(Logger.VOTE, "vote no");
          persistParticipantVote(sdk.localParticipant.id, "No");
          sdk.triggerEvent({ eventName: "custom.reign.local_no" });
        }
      });

      const removeVoteListener = sdk.subscribeToGlobalEvent(
        "custom.reign.remove-vote",
        () => {
          Logger.log(Logger.VOTE, "remove vote");
          persistParticipantVote(sdk.localParticipant.id, null);
        }
      );

      return () => {
        yesListener();
        noListener();
        removeVoteListener();
      };
    }
  }, [phase]);
};
