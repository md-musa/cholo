import  bcrypt from "bcrypt";
import mongoose, { Schema, Document } from "mongoose";
import { ICustomer, IPosDevice, IUser } from "./auth.interface";
import config from "../../../config";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["customer", "admin", "pos_device"] },
  },
  {
    discriminatorKey: "role",
    timestamps: true,
  }
);

const CustomerSchema = new Schema<ICustomer>({
  nfcUid: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discount_validity: { type: Date, default: null },
  isBlocked: { type: Boolean, default: false },
  route: { type: Schema.Types.ObjectId, ref: "Route", required: true },
  discountType: { type: String, enum: ["student", "corporate"], default: null },
});

const POSDeviceSchema = new Schema<IPosDevice>({
  deviceId: { type: String, unique: true, required: true },
  assignedBus: { type: Schema.Types.ObjectId, ref: "Bus" },
  assignedRoute: { type: Schema.Types.ObjectId, ref: "Route" },
});

UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, Number(config.BCRYPT_SALT_ROUNDS));
  next();
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
export const CustomerModel = UserModel.discriminator<ICustomer>("customer", CustomerSchema);
export const POSDeviceModel = UserModel.discriminator<IPosDevice>("pos_device", POSDeviceSchema);
export const AdminModel = UserModel.discriminator("admin", new Schema({}, { _id: false }));
