import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FareMatrix } from "./fareMatrix.model";
import { RouteModel } from "../route/route.model";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

// POST /fare-matrix
const createFareMatrix = async (req: Request, res: Response): Promise<void> => {
  const { routeId, from, to, fare } = req.body;
  const updatedBy = req.user?.userId;

  if (from === to) {
    throw ApiError.badRequest("Stoppage 'from' and 'to' must be different");
  }

  // Check if route exists
  const route = await RouteModel.findById(routeId).lean();
  if (!route) {
    throw ApiError.notFound("Route not found");
  }

  // Reject duplicate stoppage pair on the same route (bidirectional check)
  const existing = await FareMatrix.findOne({
    routeId,
    $or: [
      { from, to },
      { from: to, to: from },
    ],
  });

  if (existing) {
    throw ApiError.badRequest("A fare entry for this stoppage pair already exists on this route");
  }

  const newEntry = await FareMatrix.create({
    routeId,
    from,
    to,
    fare,
    updatedBy,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Fare entry created successfully",
    data: newEntry,
  });
};

// GET /fare-matrix/:routeId
const getFareMatrix = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;

  const entries = await FareMatrix.find({ routeId }).lean();
  const route = await RouteModel.findById(routeId).lean();

  const stopsSet = new Set<string>();
  if (route) {
    route.stopages.forEach((s) => stopsSet.add(s.name));
  }
  entries.forEach((e) => {
    stopsSet.add(e.from);
    stopsSet.add(e.to);
  });

  const stops = Array.from(stopsSet);
  const matrix: Record<string, Record<string, number | null>> = {};

  // Initialize matrix
  stops.forEach((from) => {
    matrix[from] = {};
    stops.forEach((to) => {
      matrix[from][to] = from === to ? 0 : null;
    });
  });

  // Populate matrix entries bidirectionally
  entries.forEach((e) => {
    if (matrix[e.from] && matrix[e.to]) {
      matrix[e.from][e.to] = e.fare;
      matrix[e.to][e.from] = e.fare;
    }
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare matrix retrieved successfully",
    data: matrix,
  });
};

// PATCH /fare-matrix/:id
const updateFareMatrix = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fare } = req.body;
  const updatedBy = req.user?.userId;

  if (fare === undefined || fare < 0) {
    throw ApiError.badRequest("A valid positive fare amount is required");
  }

  const updatedEntry = await FareMatrix.findByIdAndUpdate(
    id,
    {
      $set: {
        fare,
        updatedBy,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedEntry) {
    throw ApiError.notFound("Fare entry not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare entry updated successfully",
    data: updatedEntry,
  });
};

// DELETE /fare-matrix/:id
const deleteFareMatrix = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const deletedEntry = await FareMatrix.findByIdAndDelete(id);
  if (!deletedEntry) {
    throw ApiError.notFound("Fare entry not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Fare entry deleted successfully",
    data: deletedEntry,
  });
};

export const FareMatrixController = {
  createFareMatrix,
  getFareMatrix,
  updateFareMatrix,
  deleteFareMatrix,
};
