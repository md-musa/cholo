import mongoose from "mongoose";

const fareConfigSchema = new mongoose.Schema(
  {
    ratePerKm: {
      type: Number,
      required: true,
      default: 5, // ৳5 per km
    },
    minFare: {
      type: Number,
      required: true,
      default: 10, // ৳10 min fare
    },
  },
  { timestamps: true }
);

export const FareConfigModel = mongoose.model("FareConfig", fareConfigSchema);
