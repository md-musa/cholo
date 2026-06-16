import mongoose, { Schema, Document } from "mongoose";

export interface IFareMatrix extends Document {
  routeId: mongoose.Types.ObjectId;
  from: string;
  to: string;
  fare: number;
  updatedBy?: mongoose.Types.ObjectId;
}

const FareMatrixSchema: Schema = new Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Reference to the admin who updated the fare matrix
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on { routeId, from, to }
FareMatrixSchema.index({ routeId: 1, from: 1, to: 1 }, { unique: true });

export const FareMatrix = mongoose.model<IFareMatrix>("FareMatrix", FareMatrixSchema);
