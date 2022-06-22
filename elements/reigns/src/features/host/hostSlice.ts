import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { determineHost, HOST_KEY } from "./determineHost";
import { getSdk } from "../../sdk";
import { IS_MOUNTED_TABLE, persistIsMounted } from "./persistIsMounted";
import { GAME_TABLE } from "../game/Game";

export type HostState = {
  currentHost: Participant | null;
  isMounted: boolean;
  frescoUpdateCount: number;
};

const initialState: HostState = {
  currentHost: null,
  isMounted: true,
  frescoUpdateCount: 0,
};

const hostSlice = createSlice({
  name: "host",
  initialState,
  reducers: {
    updateHost: (state) => {
      const sdk = getSdk();
      const hostParams: Parameters<typeof determineHost>[0] = {
        remoteParticipants: sdk.remoteParticipants,
        mounted: sdk.storage.realtime.all(IS_MOUNTED_TABLE),
        localParticipant: sdk.localParticipant,
        currentHost: sdk.storage.realtime.get(
          GAME_TABLE,
          HOST_KEY
        ) as Participant,
      };

      state.currentHost = determineHost(hostParams);
      console.log('currentHost', state.currentHost);
      state.frescoUpdateCount = state.frescoUpdateCount + 1;

      if (
        state.isMounted &&
        !sdk.storage.realtime.get(IS_MOUNTED_TABLE, sdk.localParticipant.id)
      ) {
        // storage was cleared
        persistIsMounted(true);
      }
    },
    setMounted: (state, action: PayloadAction<boolean>) => {
      state.isMounted = action.payload;
      if (action.payload) {
        persistIsMounted(true);
      } else {
        persistIsMounted(false);
      }
    },
  },
});

export const {
  reducer,
  actions: { updateHost, setMounted },
} = hostSlice;
