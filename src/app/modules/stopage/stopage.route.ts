import express from "express";

import { FareMatrixController } from "./stopage.controller";

const router = express.Router();

router.get("/", FareMatrixController.getFareMatrix);
router.post("/", FareMatrixController.createFareMatrix);

export const FareMatrixRoute = router;
