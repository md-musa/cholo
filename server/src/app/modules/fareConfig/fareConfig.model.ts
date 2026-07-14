import mongoose from "mongoose";

const fareConfigSchema = new mongoose.Schema(
  {
    ratePerKm: {
      type: Number,
      required: true,
      default: 5,
    },
    minFare: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  { timestamps: true }
);

export const FareConfigModel = mongoose.model("FareConfig", fareConfigSchema);
