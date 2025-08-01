import express from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post("/register", validateRequest(AuthValidation.register), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.login), AuthController.login);
// router.post("/refresh-token", AuthController.refreshToken);
router.get("/user", AuthController.getSingleUserData);
router.get("/users", AuthController.getUsers);

export const AuthRouter = router;
