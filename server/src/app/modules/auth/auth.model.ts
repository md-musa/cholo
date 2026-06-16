import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import { IPassenger, IPosDevice, IAdmin, ISuperAdmin } from "./auth.interface";
import config from "../../../config";
import { USER_ROLES } from "../../../constants";

// ----------------------------------------------------
// 1. Passenger Schema
// ----------------------------------------------------
const PassengerSchema = new Schema<IPassenger>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, unique: true, required: true },
    pin: { type: String, required: true },
    role: { type: String, required: true, enum: [USER_ROLES.PASSENGER], default: USER_ROLES.PASSENGER },
    discount: { type: Number, default: 0 },
    discount_validity: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    route: { type: Schema.Types.ObjectId, ref: "Route", default: null },
    discountType: { type: String, enum: ["student", "corporate"], default: null },
    email: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

PassengerSchema.pre("save", async function (next) {
  if (this.isModified("pin")) {
    this.pin = await bcrypt.hash(this.pin, Number(config.BCRYPT_SALT_ROUNDS));
  }
  next();
});

// ----------------------------------------------------
// 2. POS Device Schema
// ----------------------------------------------------
const POSDeviceSchema = new Schema<IPosDevice>(
  {
    phoneNumber: { type: String, unique: true, required: true },
    pin: { type: String, required: true },

    role: { type: String, required: true, enum: [USER_ROLES.POS_DEVICE], default: USER_ROLES.POS_DEVICE },
    deviceId: { type: String, unique: true },
    assignedBus: { type: Schema.Types.ObjectId, ref: "Bus", default: null },
    assignedRoute: { type: Schema.Types.ObjectId, ref: "Route", default: null },
    name: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

POSDeviceSchema.pre("save", async function (next) {
  if (this.isModified("pin")) {
    this.pin = await bcrypt.hash(this.pin, Number(config.BCRYPT_SALT_ROUNDS));
  }
  next();
});

// ----------------------------------------------------
// 3. Admin Schema
// ----------------------------------------------------
const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: [USER_ROLES.ADMIN], default: USER_ROLES.ADMIN },
    phoneNumber: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, Number(config.BCRYPT_SALT_ROUNDS));
  }
  next();
});

// ----------------------------------------------------
// 4. Super Admin Schema
// ----------------------------------------------------
const SuperAdminSchema = new Schema<ISuperAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: [USER_ROLES.SUPER_ADMIN], default: USER_ROLES.SUPER_ADMIN },
    phoneNumber: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

SuperAdminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, Number(config.BCRYPT_SALT_ROUNDS));
  }
  next();
});

// Export Models
export const PassengerModel = mongoose.model<IPassenger>("Passenger", PassengerSchema);
export const POSDeviceModel = mongoose.model<IPosDevice>("POSDevice", POSDeviceSchema);
export const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
export const SuperAdminModel = mongoose.model<ISuperAdmin>("SuperAdmin", SuperAdminSchema);

