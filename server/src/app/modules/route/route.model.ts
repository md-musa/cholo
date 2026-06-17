import mongoose, { Schema, model } from "mongoose";
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
        coords: {
          type: [Number],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const RouteModel = model<IRoute>("Route", routeSchema);

