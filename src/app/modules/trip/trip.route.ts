import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TripController } from "./trip.controller";
import { TripValidation } from "./trip.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

router.post(
  "/",
  validateRequest(TripValidation.create),
  auth(USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE),
  TripController.create
);

export const TripRouter = router;
