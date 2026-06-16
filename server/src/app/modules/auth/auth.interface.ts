import mongoose, { Document } from "mongoose";
import { USER_ROLES } from "../../../constants";

export interface IPassenger extends Document {
  name: string;
  phoneNumber: string;
  pin: string;
  role: USER_ROLES.PASSENGER;
  nfcUid: string;
  balance: number;
  discount: number;
  discount_validity: Date | null;
  isBlocked: boolean;
  route: mongoose.Types.ObjectId | null;
  discountType: "student" | "corporate" | null;
  email?: string;
  avatar?: string;
}

export interface IPosDevice extends Document {
  phoneNumber: string;
  pin: string;
  role: USER_ROLES.POS_DEVICE;

  deviceId: string | null;
  assignedBus?: mongoose.Types.ObjectId;
  assignedRoute?: mongoose.Types.ObjectId;
  name?: string;
  status?: "active" | "inactive";
}

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES.ADMIN;
  phoneNumber?: string;
  avatar?: string;
}

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES.SUPER_ADMIN;
  phoneNumber?: string;
  avatar?: string;
}

