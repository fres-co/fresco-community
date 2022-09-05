import { AppState } from "../../store";

export const shouldHideResources = (state: AppState) =>
  state.game.flags.show_resources !== "true";
