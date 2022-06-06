import { useStore } from "react-redux";
import { AppState } from "../../store";
import { useInterval } from "./useInterval";
import { GamePhase } from "../../constants";
import { resolveRound } from "./resolveRound";
import { getIsHost } from "../host/persistence";

export const useCollateVotes = (isSdkLoaded: boolean) => {
  const store = useStore<AppState>();

  useInterval(
    () => {
      if (!isSdkLoaded) return;
      const state = store.getState();
      const isHost = getIsHost(state.host);
      if (!isHost) return;
      const phase = state.game.phase;
      if (phase !== GamePhase.STARTED) return;
      resolveRound(state.game);
    },
    1000,
    [store]
  );
};
