import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { ITrip } from "./trip.interface";
import { TripService } from "./trip.service";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const tripData: ITrip = req.body;
  // console.log("tripData", tripData);
  const trip = await TripService.create(tripData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Trip created successfully",
    data: trip,
  });
};

export const TripController = {
  create,
};
