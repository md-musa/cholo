import express from "express";
import { ScheduleController } from "./schedule.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ScheduleValidation } from "./schedule.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

router.get("/", ScheduleController.getAllSchedules);

router.get("/get-single-route-schedule", ScheduleController.getSchedulesByRoute);

router.post(
  "/",
  validateRequest(ScheduleValidation.create),
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ScheduleController.createSchedule
);

router.put(
  "/:id",
  validateRequest(ScheduleValidation.update),
  // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ScheduleController.updateSchedule
);

router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRouter = router;
