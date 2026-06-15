// src/app/models/errorLog.model.ts
import { Schema, model } from "mongoose";

const errorLogSchema = new Schema(
  {
    message: { type: String },
    statusCode: { type: Number },
    errorMessages: [
      {
        path: String,
        message: String,
      },
    ],
    stack: String,
    timestamp: { type: Date, default: Date.now },
    method: String,
    url: String,
  },
  { timestamps: true }
);

export const ErrorLogModel = model("ErrorLog", errorLogSchema);
