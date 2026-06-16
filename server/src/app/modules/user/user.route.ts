import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";

const router = express.Router();

// Passenger Routes
router.get("/passenger", UserController.getAllPassengers);
router.get("/passenger/:id", UserController.getPassengerById);
router.patch(
  "/passenger/:id",
  validateRequest(UserValidation.updatePassenger),
  UserController.updatePassenger
);
router.delete("/passenger/:id", UserController.deletePassenger);


// POS Device Routes
router.get("/pos-device", UserController.getAllPOSDevices);
router.get("/pos-device/:id", UserController.getPOSDeviceById);
router.patch(
  "/pos-device/:id",
  validateRequest(UserValidation.updatePOSDevice),
  UserController.updatePOSDevice
);
router.delete("/pos-device/:id", UserController.deletePOSDevice);



// Admin Routes
router.get("/admin", UserController.getAllAdmins);
router.get("/admin/:id", UserController.getAdminById);
router.patch(
  "/admin/:id",
  validateRequest(UserValidation.updateAdmin),
  UserController.updateAdmin
);
router.delete("/admin/:id", UserController.deleteAdmin);



// Super Admin Routes
router.get("/super-admin", UserController.getAllSuperAdmins);
router.get("/super-admin/:id", UserController.getSuperAdminById);
router.patch(
  "/super-admin/:id",
  validateRequest(UserValidation.updateSuperAdmin),
  UserController.updateSuperAdmin
);
router.delete("/super-admin/:id", UserController.deleteSuperAdmin);

export const UserRouter = router;
