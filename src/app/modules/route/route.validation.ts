import { z } from "zod";
import { STUDENT_DENSITY } from "../../../constants";

const stopageSchema = z.object({
  name: z.string().nonempty("Stopage name is required"),
  fare: z.number().nonnegative("Fare must be zero or positive"),
  coords: z.array(z.number()).length(2, "Coords must contain exactly two numbers"),
});

const waypointSchema = z.object({
  name: z.string().optional(),
  coords: z.array(z.number()).length(2, "Coords must contain exactly two numbers"),
  studentDensity: z.enum([STUDENT_DENSITY.LOW, STUDENT_DENSITY.MEDIUM, STUDENT_DENSITY.HIGH]).optional(),
});

const create = z.object({
  body: z.object({
    routeNo: z
      .string()
      .min(2, "Route number must be at least 2 characters long")
      .max(3, "Route number must be at most 3 characters long")
      .regex(/^R\d+$/, "Route number must start with 'R' followed by digits")
      .nonempty("Route number is required"),

    routeName: z
      .string()
      .nonempty("Route name is required")
      .transform((val) => val.toLowerCase()),

    distance: z.number().positive("Total distance must be positive").optional(),
    travelTime: z.number().positive("Estimated time must be positive").optional(),

    routeLine: z.array(z.array(z.number())).nonempty("Route line is required"),

    stopages: z.array(stopageSchema),

    assignedBuses: z.array(z.string()).optional(),

    waypoints: z.array(waypointSchema).optional(),
  }),
});

const update = z.object({
  body: z.object({
    routeNo: z
      .string()
      .min(2)
      .max(3)
      .regex(/^R\d+$/)
      .optional(),

    routeName: z
      .string()
      .transform((val) => val.toLowerCase())
      .optional(),

    distance: z.number().positive().optional(),
    travelTime: z.number().positive().optional(),

    routeLine: z.array(z.array(z.number())).optional(),

    stopages: z.array(stopageSchema).optional(),

    assignedBuses: z.array(z.string()).optional(),

    waypoints: z.array(waypointSchema).optional(),
  }),
});

export const RouteValidation = {
  create,
  update,
};
