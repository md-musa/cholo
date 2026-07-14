import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TripValidation } from "./trip.validation";
import { TripController } from "./trip.controller";

const router = express.Router();


router.post("/tap", validateRequest(TripValidation.tap), TripController.tapCard);


router.get("/active/:nfcUid", TripController.getActiveTrip);


router.get("/history/:userId", TripController.getTripHistory);


router.get("/dashboard-start", TripController.getDashboardStats);
router.get("/payment-history", TripController.getPaymentHistory);

router.get("/transactions", TripController.getTransactions);

export const TripRoute = router;
