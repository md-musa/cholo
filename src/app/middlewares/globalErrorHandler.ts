import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import handleValidationError from "../../errors/handleValidationError";

import { ZodError } from "zod";
import handleCastError from "../../errors/handleCastError";
import handleZodError from "../../errors/handleZodError";
import { logger } from "../../shared/logger";
import { IGenericErrorMessage } from "../../interfaces/common";
import { ErrorLogController } from "../modules/errorLog/errorLog.controller";

const globalErrorHandler: ErrorRequestHandler = async (error, req: Request, res: Response, next: NextFunction) => {
  if (config.NODE_ENV === "development") {
    console.log(`🐱‍🏍 globalErrorHandler ~~`, { error });
  } else {
    // console.log(`🐱‍🏍 globalErrorHandler ~~`, error);
    // logger.error(`🐱‍🏍 globalErrorHandler ~~`, error);
  }

  let statusCode = 500;
  let message = "Something went wrong !";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error?.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error?.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: "",
            message: error?.message,
          },
        ]
      : [];
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: "",
            message: error?.message,
          },
        ]
      : [];
  }

  if (config.NODE_ENV === "production") {
    try {
      await ErrorLogController.logErrorToDatabase({
        message,
        errorMessages,
        stack: error?.stack,
        method: req.method,
        statusCode,
        url: req.url,
      });
    } catch (err) {}
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.NODE_ENV !== "production" ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
