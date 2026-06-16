import { Request, Response } from "express";
import { IPaymentData } from "./payment.interface";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { RouteModel } from "../route/route.model";
import { calculateDistance, findNearestStop } from "./payment.util";
import { TransactionModel } from "./payment.model";
import { FareMatrix } from "../fareMatrix/fareMatrix.model";
import { PassengerModel } from "../auth/auth.model";
import { get } from "http";

const createPayment = async (req: Request, res: Response): Promise<void> => {
  const data: IPaymentData = req.body;

  // Validate NFC UID
  const user = await PassengerModel.findOne({ nfcUid: data.nfcUid });
  if (!user) throw ApiError.badRequest("Invalid Card");

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
    // console.log("🟡 Check-in:", newTransaction);
    const transactionObj = newTransaction.toObject();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Check-in successful",
      data: {
        ...transactionObj,
        userName: user.name,
        userBalance: user.balance,
      },
    });
  } else {
    // Check-out logic
    const lastTransaction = history[0];
    const nearestStop = findNearestStop(data.coords, route.routeLine, route.stopages);
    // console.log("Nearest stop found:", nearestStop);

    const fareMatrix = await FareMatrix.findOne({ routeId: data.routeId }).lean();
    if (!fareMatrix) throw ApiError.notFound("Fare matrix not found for this route");

    const fare = fareMatrix.fareMatrix[lastTransaction.startStopage][nearestStop.name];
    if (fare === undefined) throw ApiError.notFound("Fare not found for this route");

    if (fare > user.balance) throw ApiError.badRequest("Insufficient balance");

    // console.log(`Fare for ${lastTransaction.startStopage} to ${nearestStop.name}: ${fare}`);
    const distance = calculateDistance(lastTransaction.checkinCoords, data.coords, route.routeLine);

    user.balance = user.balance - fare;
    await user.save();

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
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
    ).lean();
    // console.log("🟢 Check-out", updatedTransaction);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Checkout successful",
      data: {
        ...updatedTransaction,
        userName: user.name,
        userBalance: user.balance,
      },
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

const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  // Get today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Get current month's date range
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = new Date();
  monthEnd.setHours(23, 59, 59, 999);

  // Run all queries in parallel
  const [todayPayments, monthPayments, totalTransactions, totalUsers, lastTransactions] = await Promise.all([
    // Today's payments
    TransactionModel.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      paymentStatus: "success",
    }).lean(),

    // This month's payments
    TransactionModel.find({
      createdAt: { $gte: monthStart, $lte: monthEnd },
      paymentStatus: "success",
    }).lean(),

    // Total successful transactions count
    TransactionModel.countDocuments({ paymentStatus: "success" }),

    // Total users count
    PassengerModel.countDocuments(),

    // Last 10 transactions
    TransactionModel.find().sort({ createdAt: -1 }).limit(10),
  ]);

  // console.log("Today's payments:", todayPayments);
  // console.log("This month's payments:", monthPayments);
  // console.log("Total transactions:", totalTransactions);
  // console.log("Total users:", totalUsers);

  // Calculate totals
  const todaysIncome = todayPayments.reduce((sum, payment) => sum + (payment.fare || 0), 0);
  const monthlyIncome = monthPayments.reduce((sum, payment) => sum + (payment.fare || 0), 0);
  const todaysTransactions = todayPayments.length;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Dashboard stats fetched successfully",
    data: {
      summary: {
        todaysIncome,
        monthlyIncome,
        totalTransactions,
        totalUsers,
        todaysTransactions,
      },
      lastTransactions,
    },
  });
};

const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.query;

  const history = await TransactionModel.find({ busId }).sort({ createdAt: -1 }).limit(10).lean();
  // console.log("Payment history:", history);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment history fetched successfully",
    data: history,
  });
};

export const PaymentController = {
  createPayment,
  getDashboardStats,
  getPaymentHistory,
};
