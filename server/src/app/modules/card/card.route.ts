import express from "express";
import { CardController } from "./card.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();


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

router.post(
  "/recharge",
  auth(USER_ROLES.PASSENGER),
  CardController.rechargeCard
);



router.post(
  "/",
  //auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.registerCard
);

router.get(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.getAllCards
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

router.patch(
  "/:id/unblock",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.unblockCard
);

router.get(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CardController.getCardDetails
);


router.get("/recharge/mock-gateway", CardController.mockGatewayPage);
router.post("/recharge/webhook", CardController.handleWebhook);

export const CardRoute = router;
