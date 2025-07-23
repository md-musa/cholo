import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/create-payment", validateRequest(PaymentValidation.create), PaymentController.createPayment);

export const PaymentRoute = router;
