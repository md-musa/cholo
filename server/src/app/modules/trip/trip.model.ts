import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    startStoppage: {
      type: String,
      required: true,
    },
    endStoppage: {
      type: String,
      default: null,
    },
    checkinTime: {
      type: Date,
      default: Date.now,
    },
    checkoutTime: {
      type: Date,
      default: null,
    },
    checkinCoords: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    checkoutCoords: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: null },
    },
    distanceInKm: {
      type: Number,
      default: null,
    },
    fare: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "incomplete"],
      default: "active",
    },
    fareStatus: {
      type: String,
      enum: ["pending", "deducted", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);


export const TripModel = mongoose.model("Trip", tripSchema);