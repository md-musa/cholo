import { StatusCodes } from "http-status-codes";
import { IGenericErrorMessage } from "../../../interfaces/error";
import sendResponse from "../../../shared/sendResponse";
import { ErrorLogModel } from "./errorLog.model";
import { Request, Response } from "express";

interface ILogErrorOptions {
  message: string;
  statusCode?: number;
  errorMessages?: IGenericErrorMessage[];
  stack?: string;
  method?: string;
  url?: string;
}

const getLogs = async (req: Request, res: Response) => {
  const sort = (req.query.sort as string) || "-createdAt";
  const logs = await ErrorLogModel.find().sort(sort).lean(); // Add .lean()

  sendResponse<ILogErrorOptions[]>(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Logs fetched successfully",
    data: logs as ILogErrorOptions[],
  });
};

const logErrorToDatabase = async (options: ILogErrorOptions) => {
  // console.log(options);
  try {
    await ErrorLogModel.create({
      message: options.message,
      statusCode: options.statusCode || 500,
      errorMessages: options.errorMessages || [],
      stack: options.stack,
      method: options.method,
      url: options.url,
    });
  } catch (err) {
    console.error("❌ Failed to log error to MongoDB:", err);
  }
};

export const ErrorLogController = {
  logErrorToDatabase,
  getLogs,
};
