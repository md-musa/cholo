import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { TripModel } from "./trip.model";
import { CardModel } from "../card/card.model";
import { RouteModel } from "../route/route.model";
import { PassengerModel } from "../auth/auth.model";
import { calculateFare, deductFare } from "../fare/fare.service";
import { calculateDistance, detectNearestStoppage } from "./trip.util";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

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
  if (!card) {
    throw ApiError.notFound("Card not registered");
  }

  // Reject if card is not linked to any user
  if (!card.userId) {
    throw ApiError.badRequest("Card is not linked to any user");
  }

  // Reject if card status is not active
  if (card.status === "blocked" || card.status === "expired") {
    throw ApiError.badRequest(`Card is ${card.status}`);
  }

  if (card.status !== "active") {
    throw ApiError.badRequest("Card is not active/issued yet");
  }

  // Reject if card balance is at loan limit
  if (card.balance <= -100) {
    throw ApiError.badRequest(
      "Insufficient balance. Please recharge to continue"
    );
  }

  // Check if card has an existing active trip
  const activeTrip = await TripModel.findOne({
    cardId: card._id,
    status: "active",
  });

  if (!activeTrip) {
    // --------------------------------------------------
    // CHECK-IN
    // --------------------------------------------------
    const startStoppage = await detectNearestStoppage(coords, routeId);

    const newTrip = await TripModel.create({
      userId: card.userId,
      cardId: card._id,
      routeId,
      busId,
      startStoppage,
      checkinCoords: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
      status: "active",
      fareStatus: "pending",
    });

    console.log("check-in");
    console.log(newTrip);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Check-in successful",
      data: {
        tripId: newTrip._id,
        startStoppage: newTrip.startStoppage,
        checkinTime: newTrip.checkinTime,
        balance: card.balance,
      },
    });
  } else {
    // --------------------------------------------------
    // CHECK-OUT
    // --------------------------------------------------
    const endStoppage = await detectNearestStoppage(coords, routeId);

    console.log(activeTrip.startStoppage, endStoppage);

    // Calculate fare before starting session (read-only, no side effects)
    let fare = 0;
    try {
      fare = await calculateFare(activeTrip.startStoppage, endStoppage, routeId);
    } catch {
      throw ApiError.internal("Fare entry not found for this route and stoppage pair");
    }

    console.log("Calculated fare:", fare);
    // Fetch route for distance calculation before session
    const route = await RouteModel.findById(routeId).lean();
    if (!route) {
      throw ApiError.notFound("Route not found");
    }

    const distance = calculateDistance(
      activeTrip.checkinCoords.coordinates,
      [coords.lng, coords.lat],
      route.routeLine
    );

    // Start MongoDB session for atomic fare deduction + trip update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let fareStatus: "deducted" | "failed" = "deducted";
      let remainingBalance = card.balance;

      try {
        remainingBalance = await deductFare(
          card._id.toString(),
          fare,
          session
        );
      } catch {
        fareStatus = "failed";
        remainingBalance = card.balance;
      }

      const updatedTrip = await TripModel.findByIdAndUpdate(
        activeTrip._id,
        {
          endStoppage,
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

      if (!updatedTrip) {
        throw ApiError.internal("Failed to update trip during checkout");
      }

      await session.commitTransaction();
      session.endSession();

      console.log("checkout Trip:", updatedTrip);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Check-out successful",
        data: {
          tripId: updatedTrip._id,
          startStoppage: activeTrip.startStoppage,
          endStoppage,
          distanceInKm: distance,
          fareDeducted: fareStatus === "deducted" ? fare : 0,
          fareStatus,
          remainingBalance,
          checkoutTime: updatedTrip.checkoutTime,
        },
      });
    } catch (checkoutError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Checkout error:", checkoutError);
      throw checkoutError;
    }
  }
};








// GET /trip/active/:nfcUid
const getActiveTrip = async (req: Request, res: Response): Promise<void> => {
  const { nfcUid } = req.params;

  const card = await CardModel.findOne({ nfcUid });
  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  const activeTrip = await TripModel.findOne({ cardId: card._id, status: "active" })
    .populate("userId routeId busId")
    .lean();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: activeTrip ? "Active trip retrieved successfully" : "No active trip found for this card",
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
    meta: {
      page,
      limit,
      total,
    },
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

  const [todayPayments, monthPayments, totalTransactions, totalUsers, lastTransactions] = await Promise.all([
    TripModel.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      fareStatus: "deducted",
    }).lean(),

    TripModel.find({
      createdAt: { $gte: monthStart, $lte: monthEnd },
      fareStatus: "deducted",
    }).lean(),

    TripModel.countDocuments({ fareStatus: "deducted" }),
    PassengerModel.countDocuments(),
    TripModel.find().sort({ createdAt: -1 }).limit(10).populate("userId routeId busId").lean(),
  ]);

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

export const TripController = {
  tapCard,
  getActiveTrip,
  getTripHistory,
  getDashboardStats,
  getPaymentHistory,
};
