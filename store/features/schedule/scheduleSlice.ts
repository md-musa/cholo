import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISchedule } from "./schedule.interface";

interface ScheduleState {
  currentSchedule: ISchedule | null;
}

const initialState: ScheduleState = {
  currentSchedule: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setCurrentSchedule: (state, action: PayloadAction<ISchedule>) => {
      state.currentSchedule = action.payload;
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
  },
});

export const { setCurrentSchedule, clearCurrentSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;
