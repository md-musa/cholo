// src/app/routes/test.route.ts
import express from "express";
import { ErrorLogController } from "./errorLog.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../constants";

const router = express.Router();

router.get("/", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ErrorLogController.getLogs);

export const ErrorLogRoute = router;
