import { z } from "zod";

const create = z.object({
  body: z.object({
    userId: z.string().nonempty("UserId is required"),
    routeId: z.string().nonempty("routeId is required"),
    busId: z.string().nonempty("BusId is required"),
    scheduleId: z.string().nonempty("ScheduleID is required"),
    nfcUid: z.string().nonempty("NFC_UID is required"),
    coords: z.array(z.number()).length(2).nonempty("coordinates are required"),
  }),
});

export const PaymentValidation = { create };
