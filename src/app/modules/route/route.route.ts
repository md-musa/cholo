import express from "express";
import { RouteController } from "./route.controller";
import validateRequest from "../../middlewares/validateRequest";
import { RouteValidation } from "./route.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

router.get("/", RouteController.getRoutes);

router.post(
  "/",
  validateRequest(RouteValidation.create),
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RouteController.addRoute
);

router.put(
  "/:id",
  validateRequest(RouteValidation.update),
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RouteController.updateRoute
);

router.delete("/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RouteController.deleteRoute);

export const RouteRouter = router;
