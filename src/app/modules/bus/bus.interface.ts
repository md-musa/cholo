import { Types } from "mongoose";
import { BUS_STATUS, BUS_TYPES } from "../../../constants";

export interface IBus {
  name: string;
  capacity: number;
  busType: BUS_TYPES; // No need to split, use the enum directly
  status: BUS_STATUS;
  assignedRouteId?: Types.ObjectId; // Correct typing for MongoDB _id
  assignedDriverId?: Types.ObjectId;
}
