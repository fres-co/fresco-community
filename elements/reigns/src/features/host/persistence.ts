import { getSdk } from "../../sdk";
import { GAME_TABLE } from "../game/Game";
import { HOST_KEY } from "./determineHost";
import { HostState } from "./hostSlice";

export const getIsHost = (state: Pick<HostState, "currentHost">) =>
  state.currentHost?.id &&
  state.currentHost?.id === getSdk().localParticipant.id;

export const setHost = (participant: Participant) => {
  getSdk().storage.realtime.set(GAME_TABLE, HOST_KEY, {
    name: participant.name,
    id: participant.id,
  });
};
