import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { IBus } from "../bus/busInterface";
import { BUS_TYPES } from "@/constants";

interface IBroadcast {
  bus: IBus;
  busType: BUS_TYPES;
  tripId: string;
  note: string;
}

export interface BroadcastingState {
  activeTrip: IBroadcast | null;
  isBroadcasting: boolean;
}

const initialState: BroadcastingState = {
  activeTrip: null,
  isBroadcasting: false,
};

const broadcastSlice = createSlice({
  name: "broadcast",
  initialState,
  reducers: {
    startBroadcasting: (state, action: PayloadAction<IBroadcast>) => {
      state.activeTrip = action.payload;
      state.isBroadcasting = true;
    },
    stopBroadcasting: (state) => {
      state.activeTrip = null;
      state.isBroadcasting = false;
    },
  },
});

export const { startBroadcasting, stopBroadcasting } = broadcastSlice.actions;
export default broadcastSlice.reducer;
