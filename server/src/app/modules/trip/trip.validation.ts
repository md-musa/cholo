import { z } from "zod";

const tap = z.object({
  body: z.object({
    nfcUid: z.string().nonempty("NFC UID is required"),
    coords: z.object({
      lat: z.number({ required_error: "Latitude is required" }),
      lng: z.number({ required_error: "Longitude is required" }),
    }),
    busId: z.string().nonempty("Bus ID is required"),
    routeId: z.string().nonempty("Route ID is required"),
  }),
});

export const TripValidation = {
  tap,
};

