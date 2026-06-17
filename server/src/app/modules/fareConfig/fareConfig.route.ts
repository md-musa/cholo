import express from "express";
import { FareConfigController } from "./fareConfig.controller";

const router = express.Router();

router.get("/", FareConfigController.getConfig);
router.patch("/", FareConfigController.updateConfig);

export const FareConfigRoute = router;
