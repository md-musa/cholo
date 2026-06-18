import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { TripModel } from "./trip.model";
import { CardModel } from "../card/card.model";
import { RouteModel } from "../route/route.model";
import { PassengerModel } from "../auth/auth.model";
import { FareConfigModel } from "../fareConfig/fareConfig.model";
import { deductFare } from "../fare/fare.service";
import { calculateDistance } from "./trip.util";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

// ── Helper: get rate per km (auto-seed default if missing) ──────────────────
async function getRatePerKm(): Promise<number> {
  let config = await FareConfigModel.findOne().lean();
  if (!config) {
    config = await FareConfigModel.create({ ratePerKm: 5 });
  }
  return config.ratePerKm;
}

// POST /trip/tap
// Receives: nfcUid, coords { lat, lng }, busId, routeId
const tapCard = async (req: Request, res: Response): Promise<void> => {
  const { nfcUid, coords, busId, routeId } = req.body;

  if (!nfcUid || !coords || !busId || !routeId) {
    throw ApiError.badRequest(
      "nfcUid, coords { lat, lng }, busId, and routeId are required"
    );
  }

  // Find card by nfcUid
  const card = await CardModel.findOne({ nfcUid });
  if (!card) throw ApiError.notFound("Card not registered");
  if (!card.userId) throw ApiError.badRequest("Card is not linked to any user");
  const passenger = await PassengerModel.findById(card.userId).select("name").lean();
  const passengerName = passenger?.name || "Passenger";

  if (card.status === "blocked" || card.status === "expired") {
    throw ApiError.badRequest(`Card is ${card.status}`);
  }
  if (card.status !== "active") {
    throw ApiError.badRequest("Card is not active/issued yet");
  }
  if (card.balance <= -100) {
    throw ApiError.badRequest("Insufficient balance. Please recharge to continue");
  }

  // Check if card has an existing active trip
  const activeTrip = await TripModel.findOne({ cardId: card._id, status: "active" });

  if (!activeTrip) {
    // ── CHECK-IN ────────────────────────────────────────────────────────────
    const newTrip = await TripModel.create({
      userId: card.userId,
      cardId: card._id,
      routeId,
      busId,
      startStoppage: null,
      checkinCoords: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
      status: "active",
      fareStatus: "pending",
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Check-in successful",
      data: {
        name: passengerName,
        checkIn: true,
        tripId: newTrip._id,
        checkinTime: newTrip.checkinTime,
        balance: card.balance,
      },
    });
  } else {
    // ── CHECK-OUT ───────────────────────────────────────────────────────────
    // Fetch route for distance calculation
    const route = await RouteModel.findById(routeId).lean();
    if (!route) throw ApiError.notFound("Route not found");

    const distance = calculateDistance(
      activeTrip.checkinCoords.coordinates,
      [coords.lng, coords.lat],
      route.routeLine
    );

    const ratePerKm = await getRatePerKm();
    const fare = Math.round(distance * ratePerKm);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let fareStatus: "deducted" | "failed" = "deducted";
      let remainingBalance = card.balance;

      try {
        remainingBalance = await deductFare(card._id.toString(), fare, session);
      } catch {
        fareStatus = "failed";
        remainingBalance = card.balance;
      }

      const updatedTrip = await TripModel.findByIdAndUpdate(
        activeTrip._id,
        {
          endStoppage: null,
          checkoutTime: new Date(),
          checkoutCoords: {
            type: "Point",
            coordinates: [coords.lng, coords.lat],
          },
          distanceInKm: distance,
          fare,
          status: "completed",
          fareStatus,
        },
        { session, new: true }
      );

      if (!updatedTrip) throw ApiError.internal("Failed to update trip during checkout");

      await session.commitTransaction();
      session.endSession();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Check-out successful",
        data: {
          name: passengerName,
          checkOut: true,
          tripId: updatedTrip._id,
          distanceInKm: parseFloat(distance.toFixed(2)),
          ratePerKm,
          fareDeducted: fareStatus === "deducted" ? fare : 0,
          fareStatus,
          remainingBalance,
          checkoutTime: updatedTrip.checkoutTime,
        },
      });
    } catch (checkoutError) {
      await session.abortTransaction();
      session.endSession();
      throw checkoutError;
    }
  }
};

// GET /trip/active/:nfcUid
const getActiveTrip = async (req: Request, res: Response): Promise<void> => {
  const { nfcUid } = req.params;

  const card = await CardModel.findOne({ nfcUid });
  if (!card) throw ApiError.notFound("Card not found");

  const activeTrip = await TripModel.findOne({ cardId: card._id, status: "active" })
    .populate("userId routeId busId")
    .lean();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: activeTrip
      ? "Active trip retrieved successfully"
      : "No active trip found for this card",
    data: activeTrip || null,
  });
};

// GET /trip/history/:userId
const getTripHistory = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const trips = await TripModel.find({ userId, status: "completed" })
    .sort({ checkoutTime: -1 })
    .skip(skip)
    .limit(limit)
    .populate("routeId busId")
    .lean();

  const total = await TripModel.countDocuments({ userId, status: "completed" });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Trip history retrieved successfully",
    meta: { page, limit, total },
    data: trips,
  });
};

// GET /trip/dashboard-start
const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date();
  monthEnd.setHours(23, 59, 59, 999);

  const [todayPayments, monthPayments, totalTransactions, totalUsers, lastTransactions] =
    await Promise.all([
      TripModel.find({ createdAt: { $gte: todayStart, $lte: todayEnd }, fareStatus: "deducted" }).lean(),
      TripModel.find({ createdAt: { $gte: monthStart, $lte: monthEnd }, fareStatus: "deducted" }).lean(),
      TripModel.countDocuments({ fareStatus: "deducted" }),
      PassengerModel.countDocuments(),
      TripModel.find().sort({ createdAt: -1 }).limit(10).populate("userId routeId busId").lean(),
    ]);

  const todaysIncome = todayPayments.reduce((sum, p) => sum + (p.fare || 0), 0);
  const monthlyIncome = monthPayments.reduce((sum, p) => sum + (p.fare || 0), 0);
  const todaysTransactions = todayPayments.length;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Dashboard stats fetched successfully",
    data: {
      summary: { todaysIncome, monthlyIncome, totalTransactions, totalUsers, todaysTransactions },
      lastTransactions,
    },
  });
};

// GET /trip/payment-history
const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.query;
  const filter: Record<string, any> = { status: "completed" };
  if (busId) filter.busId = busId;

  const history = await TripModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId routeId busId")
    .lean();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment history fetched successfully",
    data: history,
  });
};

// GET /trip/transactions?search=phoneNumber  (admin panel)
const getTransactions = async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;
  const filter: Record<string, any> = { status: "completed" };

  if (search && typeof search === "string" && search.trim()) {
    const passengers = await PassengerModel.find({
      phoneNumber: { $regex: search.trim(), $options: "i" },
    })
      .select("_id")
      .lean();
    filter.userId = { $in: passengers.map((p) => p._id) };
  }

  const transactions = await TripModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "name phoneNumber")
    .populate("routeId", "routeNo routeName")
    .populate("busId", "name")
    .lean();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Transactions fetched successfully",
    data: transactions,
  });
};

export const TripController = {
  tapCard,
  getActiveTrip,
  getTripHistory,
  getDashboardStats,
  getPaymentHistory,
  getTransactions,
};
