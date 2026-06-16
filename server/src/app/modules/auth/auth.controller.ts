import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PassengerModel, POSDeviceModel, AdminModel, SuperAdminModel } from "./auth.model";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const userInfo = req.body;
  console.log(userInfo);

  const { accessToken, refreshToken, user } = await AuthService.registerUser(userInfo);
  res.cookie("refreshToken", refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User registered successfully",
    data: { accessToken, user },
  });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const userInfo = req.body;

  const { accessToken, refreshToken, user } = await AuthService.login(userInfo);
  res.cookie("refreshToken", refreshToken);
  console.log("accessToken", accessToken);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully",
    data: { accessToken, user },
  });
};

const getSingleUserData = async (req: Request, res: Response): Promise<void> => {
  console.log(req.params);
  console.log(req.query);
  const { userId } = req.query;
  const user = await AuthService.getSingleUserData(userId as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

const getUsers = async (req: Request, res: Response): Promise<void> => {
  const role = req.query.role as string;

  let users: any[] = [];
  if (role === "passenger") {
    users = await PassengerModel.find({});
  } else if (role === "pos_device") {
    users = await POSDeviceModel.find({});
  } else if (role === "admin") {
    users = await AdminModel.find({});
  } else if (role === "super_admin") {
    users = await SuperAdminModel.find({});
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await AuthService.refreshToken(token);
  
  res.cookie("refreshToken", result.refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New access token generated successfully",
    data: { accessToken: result.accessToken },
  });
};

export const AuthController = {
  registerUser,
  login,
  getSingleUserData,
  getUsers,
  refreshToken,
};
