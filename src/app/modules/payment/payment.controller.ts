import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { RouteModel } from "../route/route.model";
import { calculateDistance, findNearestStop } from "./payment.util";
import { TransactionModel } from "./payment.model";
import { FareMatrix } from "../fareMatrix/fareMatrix.model";
import UserModel from "../auth/auth.model";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  const data: IPaymentData = req.body;

  // Validate NFC UID
  // const user = await UserModel.findOne({ nfcUid: data.nfcUid });
  // if (!user) throw ApiError.badRequest("Invalid Card");

  // Validate route
  const route = await RouteModel.findById(data.routeId).lean();
  if (!route) throw ApiError.notFound("Route not found");

  const history = await TransactionModel.find({ nfcUid: data.nfcUid }).sort({ createdAt: -1 }).limit(1).lean();

  // Check-in logic
  if (history.length === 0 || history[0].endStopage) {
    const nearestStop = findNearestStop(data.coords, route.routeLine, route.stopages);

    const newTransaction = await TransactionModel.create({
      nfcUid: data.nfcUid,
      routeId: data.routeId,
      busId: data.busId,
      startStopage: nearestStop.name,
      checkinCoords: data.coords,
    });
    console.log("New transaction created:", newTransaction);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Check-in successful",
      data: newTransaction,
    });
  } else {
    // Check-out logic
    const lastTransaction = history[0];
    const nearestStop = findNearestStop(data.coords, route.routeLine, route.stopages);
    console.log("Nearest stop found:", nearestStop);

    const fareMatrix = await FareMatrix.findOne({ routeId: data.routeId }).lean();
    if (!fareMatrix) throw ApiError.notFound("Fare matrix not found for this route");

    const fare = fareMatrix.fareMatrix[lastTransaction.startStopage][nearestStop.name];
    if (fare === undefined) throw ApiError.notFound("Fare not found for this route");

    console.log(`Fare for ${lastTransaction.startStopage} to ${nearestStop.name}: ${fare}`);
    const distance = calculateDistance(lastTransaction.checkinCoords, data.coords, route.routeLine);

    const updatedData = await TransactionModel.findByIdAndUpdate(
      lastTransaction._id,
      {
        endStopage: nearestStop.name,
        checkoutTime: new Date(),
        checkoutCoords: data.coords,
        distanceInKm: distance,
        fare: fare,
        paymentStatus: "success",
      },
      { new: true, runValidators: true }
    );
    console.log("Transaction updated:", updatedData);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Checkout successful",
      data: updatedData,
    });
  }
};

type HandlePaymentInput = {
  nfcUid: string;
  fare: number;
};

// await handlePayment({ nfcUid: data.nfcUID, fare: nearestStop.fare });
async function handlePayment({ nfcUid, fare }: HandlePaymentInput): Promise<void> {
  // Simulate async behavior
  await new Promise((res) => setTimeout(res, 300));

  // Random outcome
  const outcomes = ["success", "insufficient_balance", "success", "invalid_nfc", "success"];
  const result = outcomes[Math.floor(Math.random() * outcomes.length)];

  switch (result) {
    case "success":
      console.log(`Payment of ${fare} successful for UID: ${nfcUid}`);
      return;

    case "insufficient_balance":
      throw ApiError.badRequest("Insufficient balance");

    case "invalid_nfc":
      throw ApiError.badRequest("Invalid NFC UID");

    default:
      throw ApiError.internal("Unknown error during payment");
  }
}

export const PaymentController = {
  createPayment,
};
