import { z } from "zod";

const PassengerRegisterSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phoneNumber: z.string().nonempty("Phone number is required"),
  pin: z.string().length(6, "PIN must be 6 digits").nonempty("PIN is required"),
  role: z.literal("passenger"),
  nfcUid: z.string().optional(),
  route: z.string().optional(),
  balance: z.number().default(0),
  discount: z.number().optional(),
  discount_validity: z.coerce.date().nullable().optional(),
  discountType: z.enum(["student", "corporate"]).nullable().optional(),
  isBlocked: z.boolean().optional(),
  email: z.string().email("Invalid email format").optional(),
  avatar: z.string().optional(),
});

const POSDeviceRegisterSchema = z.object({
  phoneNumber: z.string().nonempty("Phone number is required"),
  pin: z.string().length(6, "PIN must be 6 digits").nonempty("PIN is required"),
  role: z.literal("pos_device"),
  deviceId: z.string().optional(),
  assignedBus: z.string().length(24, "Invalid MongoDB ObjectId").optional(),
  assignedRoute: z.string().length(24, "Invalid MongoDB ObjectId").optional(),
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const AdminRegisterSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").nonempty("Password is required"),
  role: z.literal("admin"),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
});

const SuperAdminRegisterSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").nonempty("Password is required"),
  role: z.literal("super_admin"),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
});

const register = z.object({
  body: z.discriminatedUnion("role", [
    PassengerRegisterSchema,
    POSDeviceRegisterSchema,
    AdminRegisterSchema,
    SuperAdminRegisterSchema,
  ]),
});

const login = z.object({
  body: z.union([
    z.object({
      email: z.string().email("Invalid email format").nonempty("Email is required"),
      password: z.string().min(6, "Password must be at least 6 characters long").nonempty("Password is required"),
      role: z.enum(["admin", "super_admin"]).optional(),
    }),
    z.object({
      phoneNumber: z.string().nonempty("Phone number is required"),
      pin: z.string().nonempty("PIN is required"),
      role: z.enum(["passenger", "pos_device"]).optional(),
    }),
  ]),
});

export const AuthValidation = { register, login };

