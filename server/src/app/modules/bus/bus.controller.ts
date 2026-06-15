import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { IBus } from "./bus.interface";
import { BusService } from "./bus.service";
import ApiError from "../../../errors/ApiError";

const getBuses = async (req: Request, res: Response) => {
  const buses = await BusService.getBuses();

  sendResponse<IBus[]>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Buses fetched successfully",
    data: buses,
  });
};

const createBus = async (req: Request, res: Response) => {
  const busInfo: IBus = req.body;

  const bus = await BusService.createBus(busInfo);

  sendResponse<IBus>(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Bus created successfully",
    data: bus,
  });
};

const updateBus = async (req: Request, res: Response) => {
  const busId = req.params.id;
  if (!busId) throw ApiError.badRequest("Bus ID is required");

  const updatedBus = await BusService.updateBus(busId, req.body);

  sendResponse<IBus>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Bus updated successfully",
    data: updatedBus,
  });
};

const deleteBus = async (req: Request, res: Response) => {
  const busId = req.params.id;
  if (!busId) throw ApiError.badRequest("Bus ID is required");

  const deletedBus = await BusService.deleteBus(busId);

  sendResponse<IBus>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Bus deleted successfully",
    data: deletedBus,
  });
};

export const BusController = {
  createBus,
  getBuses,
  updateBus,
  deleteBus,
};
