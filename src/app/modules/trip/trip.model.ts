import mongoose, { Schema, model } from "mongoose";
import { ITrip } from "./trip.interface";
import { BUS_TYPES, TRIP_STATUS } from "../../../constants";

const tripSchema = new Schema<ITrip>(
  {
    routeId: { type: Schema.Types.ObjectId, ref: "Route",required: true },
    hostId:  { type: Schema.Types.ObjectId, ref: "User",required: true },
    busName: { type: String, required: true },
    departureTime: { type: Date, required: false },
    direction: { type: String, required: false },
    status: {
      type: String,
      enum: [TRIP_STATUS.SCHEDULED, TRIP_STATUS.ONGOING, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELED],
      required: false,
    },

    busType: { type: String, enum: Object.values(BUS_TYPES), required: true },
    note: { type: String, required: false },
  }
);

export const TripModel = model<ITrip>("Trip", tripSchema);