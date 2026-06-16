import express from "express";
import { CardController } from "./card.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

// Passenger-only endpoints
router.get(
  "/me",
  auth(USER_ROLES.PASSENGER),
  CardController.getMyCard
);

router.post(
  "/recharge/init",
  auth(USER_ROLES.PASSENGER),
  CardController.initRecharge
);


// ADD NEW CARD - ADMIN ONLY
router.post(
  "/",
  //auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.registerCard
);

router.patch(
  "/:id/issue",
  //auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.issueCard
);

router.patch(
  "/:id/block",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.blockCard
);

router.get(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.getCardDetails
);

// Public payment simulation routes (no authentication required)
router.get("/recharge/mock-gateway", CardController.mockGatewayPage);
router.post("/recharge/webhook", CardController.handleWebhook);

export const CardRoute = router;
