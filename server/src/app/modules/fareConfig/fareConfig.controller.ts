import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FareConfigModel } from "./fareConfig.model";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

const getConfig = async (req: Request, res: Response): Promise<void> => {
  let config = await FareConfigModel.findOne().lean();
  if (!config) {

    config = await FareConfigModel.create({ ratePerKm: 5, minFare: 10 });
  } else if (config.minFare === undefined) {
    config = await FareConfigModel.findOneAndUpdate(
      {},
      { $set: { minFare: 10 } },
      { new: true }
    ).lean();
  }
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare config retrieved successfully",
    data: config,
  });
};


const updateConfig = async (req: Request, res: Response): Promise<void> => {
  const { ratePerKm, minFare } = req.body;
  const updateData: Record<string, any> = {};

  if (ratePerKm !== undefined) {
    if (typeof ratePerKm !== "number" || ratePerKm <= 0) {
      throw ApiError.badRequest("ratePerKm must be a positive number");
    }
    updateData.ratePerKm = ratePerKm;
  }

  if (minFare !== undefined) {
    if (typeof minFare !== "number" || minFare < 0) {
      throw ApiError.badRequest("minFare must be a non-negative number");
    }
    updateData.minFare = minFare;
  }

  if (Object.keys(updateData).length === 0) {
    throw ApiError.badRequest("At least one configuration field is required");
  }

  const config = await FareConfigModel.findOneAndUpdate(
    {},
    updateData,
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
