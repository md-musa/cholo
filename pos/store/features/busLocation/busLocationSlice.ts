import { store } from "@/store/storeConfig";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TripData {
  _id: string;
  routeId: string;
  hostId: string;
  busName: string;
  departureTime?: string;
  direction?: "to_campus" | "from_campus";
  busType: string;
  note?: string;
}

export interface BusLocationData {
  trip: TripData;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  currUserCnt: number;
  timestamp: string;
}

interface BusLocationState {
  activeBuses: Record<string, BusLocationData>;
  currentlyConnectedUserCount: number;
}

const initialState: BusLocationState = {
  activeBuses: {},
  currentlyConnectedUserCount: 0,
};

const busLocationSlice = createSlice({
  name: "busLocation",
  initialState,
  reducers: {
    updateBusLocation: (state, action: PayloadAction<BusLocationData>) => {
      const data = action.payload;
      if (!data.trip?.busName) return;

      // const { isBroadcasting, activeTrip } = store.getState().broadcast;
      // if (isBroadcasting && data.trip.busName === activeTrip?.bus.name) return;
      // console.log("[🚍]", JSON.stringify(data, null, 2));
      state.activeBuses[data.trip.busName] = data;
      state.currentlyConnectedUserCount = data.currUserCnt;
    },

    clearBuses: (state) => {
      state.activeBuses = {};
    },

    removeInactiveBuses: (state) => {
      const now = Date.now();
      const filtered: Record<string, BusLocationData> = {};

      Object.entries(state.activeBuses).forEach(([busName, data]) => {
        const timeDiff = now - new Date(data.timestamp).getTime();
        if (timeDiff < 180000) {
          filtered[busName] = data;
        }
      });

      state.activeBuses = filtered;
    },
  },
});

export const { updateBusLocation, clearBuses, removeInactiveBuses } = busLocationSlice.actions;

export default busLocationSlice.reducer;
