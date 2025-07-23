import mongoose, { Schema } from "mongoose";
import { ISchedule } from "./schedule.interface";
import { SCHEDULE_DIRECTIONS, SCHEDULE_OPERATING_DAYS, SCHEDULE_MODES, SCHEDULE_USER_TYPES } from "../../../constants";

const scheduleSchema: Schema<ISchedule> = new Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    direction: {
      type: String,
      enum: [SCHEDULE_DIRECTIONS.TO_CAMPUS, SCHEDULE_DIRECTIONS.FROM_CAMPUS],
      required: true,
    },
    time: {
      type: String, // Store time as string (HH:mm) format
      required: true,
    },
    userType: {
      type: String,
      enum: [SCHEDULE_USER_TYPES.STUDENT, SCHEDULE_USER_TYPES.EMPLOYEE],
      required: true,
    },
    mode: {
      type: String,
      enum: [SCHEDULE_MODES.REGULAR, SCHEDULE_MODES.MID_TERM, SCHEDULE_MODES.FINAL_TERM, SCHEDULE_MODES.RAMADAN],
      required: true,
    },
    operatingDays: {
      type: String,
      enum: [SCHEDULE_OPERATING_DAYS.WEEKDAYS, SCHEDULE_OPERATING_DAYS.FRIDAY],
      required: true,
    },
    serviceType: {
      type: String,
    },
    note: {
      type: String,
    },
    assignedBuses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],
  },
  { timestamps: true }
);

// Create the Mongoose model for the Schedule
const ScheduleModel = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default ScheduleModel;
