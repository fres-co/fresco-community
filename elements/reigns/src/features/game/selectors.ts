import { AppState } from "../../store";

export const SHOW_RESOURCES_FLAG = "show_resources";

export const shouldHideResources = (state: AppState) =>
  state.game.flags[SHOW_RESOURCES_FLAG] !== "true";
