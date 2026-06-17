import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FareConfigModel } from "./fareConfig.model";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

// GET /fare-config — returns the current per-km rate (or default 5 if not set)
const getConfig = async (req: Request, res: Response): Promise<void> => {
  let config = await FareConfigModel.findOne().lean();
  if (!config) {
    // Auto-seed default on first access
    config = await FareConfigModel.create({ ratePerKm: 5 });
  }
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare config retrieved successfully",
    data: config,
  });
};

// PATCH /fare-config — update the per-km rate (upsert)
const updateConfig = async (req: Request, res: Response): Promise<void> => {
  const { ratePerKm } = req.body;
  if (typeof ratePerKm !== "number" || ratePerKm <= 0) {
    throw ApiError.badRequest("ratePerKm must be a positive number");
  }

  const config = await FareConfigModel.findOneAndUpdate(
    {},
    { ratePerKm },
    { upsert: true, new: true }
  ).lean();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare config updated successfully",
    data: config,
  });
};

export const FareConfigController = { getConfig, updateConfig };
