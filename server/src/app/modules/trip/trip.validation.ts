import { z } from "zod";
import { BUS_TYPES, TRIP_STATUS } from "../../../constants";

export const create = z.object({
  body: z.object({
    routeId: z.string().nonempty("Route ID is required"),
    hostId: z.string().nonempty("Host ID is required"),
    busName: z.string().nonempty("Bus name is required"),
    departureTime: z.coerce.date().optional(),
    busType: z.enum([BUS_TYPES.STUDENT, BUS_TYPES.EMPLOYEE]),
    direction: z.string().optional(),
    status: z.enum([TRIP_STATUS.SCHEDULED, TRIP_STATUS.ONGOING, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED]).optional(),
    note: z.string().optional(),
  }),
});

export const TripValidation = {
  create,
};
