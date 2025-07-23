import mongoose, { Schema } from "mongoose";
import { USER_ROLES } from "../../../constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "pos_device";
}
export interface ICustomer extends IUser {
  nfcUid: string;
  balance: number;
  discount: number;
  discount_validity: Date;
  isBlocked: boolean;
  route: mongoose.Types.ObjectId;
  discountType: "student" | "corporate";
}

export interface IPosDevice extends IUser {
  deviceId: string;
  assignedBus: mongoose.Types.ObjectId;
  assignedRoute: mongoose.Types.ObjectId;
}
