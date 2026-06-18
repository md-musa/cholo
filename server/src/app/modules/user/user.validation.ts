import { z } from "zod";

const updatePassenger = z.object({
  body: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    pin: z.string().length(6, "PIN must be 6 digits").optional(),
    nfcUid: z.string().optional(),
    route: z.string().optional(),
    balance: z.number().optional(),
    discount: z.number().optional(),
    discount_validity: z.coerce.date().nullable().optional(),
    discountType: z.enum(["student", "corporate"]).nullable().optional(),
    isBlocked: z.boolean().optional(),
    email: z.string().email("Invalid email format").optional(),
    avatar: z.string().optional(),
  }),
});


const objectIdOrEmpty = z.union([
  z.string().length(24, "Invalid MongoDB ObjectId"),
  z.literal(""),
  z.null()
]).optional();

const createPOSDevice = z.object({
  body: z.object({
    phoneNumber: z.string({ required_error: "Phone number is required" }),
    pin: z.string({ required_error: "PIN is required" }).min(4, "PIN must be 4–6 digits").max(6, "PIN must be 4–6 digits").regex(/^\d+$/, "PIN must contain only digits"),
    assignedBus: objectIdOrEmpty,
    assignedRoute: objectIdOrEmpty,
    name: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

const updatePOSDevice = z.object({
  body: z.object({
    phoneNumber: z.string().optional(),
    pin: z.string().min(4, "PIN must be 4–6 digits").max(6, "PIN must be 4–6 digits").regex(/^\d+$/, "PIN must contain only digits").optional(),
    assignedBus: objectIdOrEmpty,
    assignedRoute: objectIdOrEmpty,
    name: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

const updateAdmin = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    phoneNumber: z.string().optional(),
    avatar: z.string().optional(),
  }),
});


const updateSuperAdmin = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    phoneNumber: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const UserValidation = {
  updatePassenger,
  createPOSDevice,
  updatePOSDevice,
  updateAdmin,
  updateSuperAdmin,
};
