import mongoose, { Schema, model } from "mongoose";
import { STUDENT_DENSITY } from "../../../constants";
import { IRoute } from "./route.interface";

const routeSchema = new Schema<IRoute>(
  {
    routeNo: { type: String, required: true, unique: true },
    routeName: { type: String, required: true, unique: true },
    distance: { type: Number, default: 0 },
    travelTime: { type: Number, default: 0 },

    routeLine: {
      type: [[Number]],
      required: true,
    },

    stopages: [
      {
        name: { type: String, required: true },
        fare: { type: Number, required: true },
        coords: {
          type: [Number],
          required: true,
        },
      },
    ],

    assignedBuses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],

    waypoints: [
      {
        name: { type: String },
        coords: {
          type: [Number], // [lat, lng]
        },
        studentDensity: {
          type: String,
          enum: Object.values(STUDENT_DENSITY),
        },
      },
    ],
  },
  { timestamps: true }
);

export const RouteModel = model<IRoute>("Route", routeSchema);
