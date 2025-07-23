import { SCHEDULE_OPERATING_DAYS } from "./../../../constants/index";
import { z } from "zod";
import { SCHEDULE_DIRECTIONS, SCHEDULE_MODES, SCHEDULE_USER_TYPES } from "../../../constants";

export const create = z.object({
  body: z.object({
    routeId: z.string().nonempty("Route ID is required"),
    direction: z.enum([SCHEDULE_DIRECTIONS.TO_CAMPUS, SCHEDULE_DIRECTIONS.FROM_CAMPUS]),
    time: z.string().nonempty("Time is required"),
    userType: z.enum([SCHEDULE_USER_TYPES.STUDENT, SCHEDULE_USER_TYPES.EMPLOYEE]),
    mode: z.enum([SCHEDULE_MODES.REGULAR, SCHEDULE_MODES.MID_TERM, SCHEDULE_MODES.FINAL_TERM, SCHEDULE_MODES.RAMADAN]),
    operatingDays: z.enum([SCHEDULE_OPERATING_DAYS.WEEKDAYS, SCHEDULE_OPERATING_DAYS.FRIDAY]),
    note: z.string().optional(),
    serviceType: z.string().optional(),
    assignedBuses: z.array(z.string()).optional(),
  }),
});

export const update = z.object({
  body: z.object({
    routeId: z.string().optional(),
    direction: z.enum([SCHEDULE_DIRECTIONS.TO_CAMPUS, SCHEDULE_DIRECTIONS.FROM_CAMPUS]).optional(),
    time: z.string().optional(),
    userType: z.enum([SCHEDULE_USER_TYPES.STUDENT, SCHEDULE_USER_TYPES.EMPLOYEE]).optional(),
    mode: z
      .enum([SCHEDULE_MODES.REGULAR, SCHEDULE_MODES.MID_TERM, SCHEDULE_MODES.FINAL_TERM, SCHEDULE_MODES.RAMADAN])
      .optional(),
    operatingDays: z.enum([SCHEDULE_OPERATING_DAYS.WEEKDAYS, SCHEDULE_OPERATING_DAYS.FRIDAY]).optional(),
    note: z.string().optional(),
    serviceType: z.string().optional(),

    assignedBuses: z.array(z.string()).optional(),
  }),
});

export const ScheduleValidation = {
  create,
  update,
};
