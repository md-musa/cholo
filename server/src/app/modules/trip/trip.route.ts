import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TripValidation } from "./trip.validation";
import { TripController } from "./trip.controller";

const router = express.Router();

// NFC Tap Check-in / Check-out
router.post("/tap", validateRequest(TripValidation.tap), TripController.tapCard);

// Get active trip details for a card
router.get("/active/:nfcUid", TripController.getActiveTrip);

// Get passenger completed trip history
router.get("/history/:userId", TripController.getTripHistory);

// Dashboard and payment stats history
router.get("/dashboard-start", TripController.getDashboardStats);
router.get("/payment-history", TripController.getPaymentHistory);

// Admin: all transactions with optional phone search
router.get("/transactions", TripController.getTransactions);

export const TripRoute = router;
