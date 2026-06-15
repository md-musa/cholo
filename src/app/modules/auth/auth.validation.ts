import { z } from "zod";
import { USER_ROLES } from "../../../constants";

const BaseSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format").nonempty("Use your university email"),
  role: z.nativeEnum(USER_ROLES),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const CustomerSchema = BaseSchema.extend({
  role: z.literal("customer"),
  route: z.string().nonempty("Route Id is required"),
  balance: z.number().default(0),
  discount: z.number().default(0),
  discount_validity: z.coerce.date().optional(),
  discountType: z.enum(["student", "corporate"]).optional(),
  isBlocked: z.boolean().optional(),
});

const POSDeviceSchema = BaseSchema.extend({
  role: z.literal("pos_device"),
  deviceId: z.string().nonempty("Device ID is required"),
  assignedBus: z.string().length(24, "Invalid MongoDB ObjectId").optional(),
  assignedRoute: z.string().length(24, "Invalid MongoDB ObjectId").optional(),
});

const AdminSchema = BaseSchema.extend({
  role: z.literal("admin"),
});

const register = z.object({
  body: z.discriminatedUnion("role", [CustomerSchema, POSDeviceSchema, AdminSchema]),
});

const login = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long").nonempty("Password is required"),
  }),
});

export const AuthValidation = { register, login };
