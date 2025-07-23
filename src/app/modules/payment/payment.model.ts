import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    nfcUid: {
      type: String,
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
    startStopage: {
      type: String,
      required: true,
    },
    endStopage: {
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
      type: [Number],
      required: true,
    },
    checkoutCoords: {
      type: [Number],
      default: null,
    },

    distanceInKm: {
      type: Number,
    },
    fare: {
      type: Number,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model("Transaction", paymentSchema);
