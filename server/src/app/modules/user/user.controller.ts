import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";

// -------------------------------------------------------------------------
// Passenger Controllers
// -------------------------------------------------------------------------
const createPassenger = async (req: Request, res: Response) => {
  const result = await UserService.createPassenger(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Passenger created successfully",
    data: result,
  });
};

const getAllPassengers = async (req: Request, res: Response) => {
  const result = await UserService.getAllPassengers();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Passengers retrieved successfully",
    data: result,
  });
};

const getPassengerById = async (req: Request, res: Response) => {
  const result = await UserService.getPassengerById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Passenger retrieved successfully",
    data: result,
  });
};

const updatePassenger = async (req: Request, res: Response) => {
  const result = await UserService.updatePassenger(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Passenger updated successfully",
    data: result,
  });
};

const deletePassenger = async (req: Request, res: Response) => {
  const result = await UserService.deletePassenger(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Passenger deleted successfully",
    data: result,
  });
};

// -------------------------------------------------------------------------
// POSDevice Controllers
// -------------------------------------------------------------------------
const createPOSDevice = async (req: Request, res: Response) => {
  const result = await UserService.createPOSDevice(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "POS Device created successfully",
    data: result,
  });
};

const getAllPOSDevices = async (req: Request, res: Response) => {
  const result = await UserService.getAllPOSDevices();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "POS Devices retrieved successfully",
    data: result,
  });
};

const getPOSDeviceById = async (req: Request, res: Response) => {
  const result = await UserService.getPOSDeviceById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "POS Device retrieved successfully",
    data: result,
  });
};

const updatePOSDevice = async (req: Request, res: Response) => {
  const result = await UserService.updatePOSDevice(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "POS Device updated successfully",
    data: result,
  });
};

const deletePOSDevice = async (req: Request, res: Response) => {
  const result = await UserService.deletePOSDevice(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "POS Device deleted successfully",
    data: result,
  });
};

// -------------------------------------------------------------------------
// Admin Controllers
// -------------------------------------------------------------------------
const createAdmin = async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
};

const getAllAdmins = async (req: Request, res: Response) => {
  const result = await UserService.getAllAdmins();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: result,
  });
};

const getAdminById = async (req: Request, res: Response) => {
  const result = await UserService.getAdminById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
};

const updateAdmin = async (req: Request, res: Response) => {
  const result = await UserService.updateAdmin(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
};

const deleteAdmin = async (req: Request, res: Response) => {
  const result = await UserService.deleteAdmin(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
};

// -------------------------------------------------------------------------
// Super Admin Controllers
// -------------------------------------------------------------------------
const createSuperAdmin = async (req: Request, res: Response) => {
  const result = await UserService.createSuperAdmin(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Super Admin created successfully",
    data: result,
  });
};

const getAllSuperAdmins = async (req: Request, res: Response) => {
  const result = await UserService.getAllSuperAdmins();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Super Admins retrieved successfully",
    data: result,
  });
};

const getSuperAdminById = async (req: Request, res: Response) => {
  const result = await UserService.getSuperAdminById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Super Admin retrieved successfully",
    data: result,
  });
};

const updateSuperAdmin = async (req: Request, res: Response) => {
  const result = await UserService.updateSuperAdmin(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Super Admin updated successfully",
    data: result,
  });
};

const deleteSuperAdmin = async (req: Request, res: Response) => {
  const result = await UserService.deleteSuperAdmin(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Super Admin deleted successfully",
    data: result,
  });
};

export const UserController = {
  createPassenger,
  getAllPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger,

  createPOSDevice,
  getAllPOSDevices,
  getPOSDeviceById,
  updatePOSDevice,
  deletePOSDevice,

  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,

  createSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  deleteSuperAdmin,
};
