import express from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post("/registration", validateRequest(AuthValidation.register), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.login), AuthController.login);
router.get("/user", AuthController.getSingleUserData);
router.get("/users", AuthController.getUsers);

// router.post("/refresh-token", AuthController.refreshToken);
export const AuthRouter = router;
