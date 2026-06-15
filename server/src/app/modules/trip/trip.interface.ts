import { Schema } from "mongoose";
import { BUS_TYPES, TRIP_STATUS } from "../../../constants";


export interface ITrip {
  routeId: Schema.Types.ObjectId | string;
  hostId: Schema.Types.ObjectId | string;
  busName: string;
  departureTime?: Date;
  direction?: string;
  status: TRIP_STATUS.SCHEDULED | TRIP_STATUS.ONGOING | TRIP_STATUS.COMPLETED | TRIP_STATUS.CANCELED;
  busType: BUS_TYPES.STUDENT | BUS_TYPES.EMPLOYEE;
  note?: string;
}
