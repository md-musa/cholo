import { z } from "zod";
import { BUS_STATUS, BUS_TYPES } from "../../../constants";

export const create = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty("Bus name is required")
      .transform((val) => (val ? val.toLowerCase().trim() : val)),
    busType: z.nativeEnum(BUS_TYPES),
    capacity: z.number().int().positive("Capacity must be a positive integer").optional(),
    status: z.nativeEnum(BUS_STATUS).optional(),
    assignedRouteId: z.string().optional(),
    assignedDriverId: z.string().optional(),
  }),
});

export const update = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty("Bus name is required")
      .transform((val) => (val ? val.toLowerCase().trim() : val))
      .optional(),
    busType: z.nativeEnum(BUS_TYPES).optional(),
    capacity: z.number().int().positive("Capacity must be a positive integer").optional(),
    status: z.nativeEnum(BUS_STATUS).optional(),
    assignedRouteId: z.string().optional(),
    assignedDriverId: z.string().optional(),
  }),
});

export const BusValidation = { create, update };
