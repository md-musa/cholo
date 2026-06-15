import { Types } from "mongoose";
import { SCHEDULE_DIRECTIONS, SCHEDULE_MODES, SCHEDULE_USER_TYPES, SCHEDULE_OPERATING_DAYS } from "../../../constants";

export interface ISchedule {
  routeId: Types.ObjectId;
  direction: SCHEDULE_DIRECTIONS.TO_CAMPUS | SCHEDULE_DIRECTIONS.FROM_CAMPUS;
  time: string; // Time as string in "HH:mm" format
  userType: SCHEDULE_USER_TYPES.STUDENT | SCHEDULE_USER_TYPES.EMPLOYEE;
  mode: SCHEDULE_MODES.REGULAR | SCHEDULE_MODES.MID_TERM | SCHEDULE_MODES.FINAL_TERM | SCHEDULE_MODES.RAMADAN;
  operatingDays: SCHEDULE_OPERATING_DAYS.WEEKDAYS | SCHEDULE_OPERATING_DAYS.FRIDAY;
  serviceType?: string; // Made optional
  note?: string; // Made optional
  assignedBuses?: Types.ObjectId[];
}
