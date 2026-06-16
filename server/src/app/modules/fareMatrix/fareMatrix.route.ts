import express from "express";
import { FareMatrixController } from "./fareMatrix.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

// Public route to view the fare matrix for a route
router.get("/:routeId", FareMatrixController.getFareMatrix);

// Admin-only endpoints for managing the fare matrix
router.post(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FareMatrixController.createFareMatrix
);

router.patch(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FareMatrixController.updateFareMatrix
);

router.delete(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  FareMatrixController.deleteFareMatrix
);

export const FareMatrixRoute = router;
