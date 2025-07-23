import { Request, Response } from "express";
import { FareMatrix } from "./stopage.model";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

export const createFareMatrix = async (req: Request, res: Response) => {
  const { routeId, fareMatrix } = req.body;

  const matrix = await FareMatrix.create({
    routeId,
    fareMatrix,
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Fare matrix created successfully",
    data: matrix,
  });
};

export const getFareMatrix = async (req: Request, res: Response) => {
  const matrix = await FareMatrix.find({ routeId: req.params.routeId }).lean();
  if (!matrix) throw ApiError.notFound("Fare matrix not found for this route");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Fare matrix created successfully",
    data: matrix,
  });
};

export const FareMatrixController = {
  createFareMatrix,
    getFareMatrix,
}