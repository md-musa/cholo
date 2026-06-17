import mongoose from "mongoose";

const fareConfigSchema = new mongoose.Schema(
  {
    ratePerKm: {
      type: Number,
      required: true,
      default: 5, // ৳5 per km
    },
  },
  { timestamps: true }
);

export const FareConfigModel = mongoose.model("FareConfig", fareConfigSchema);
