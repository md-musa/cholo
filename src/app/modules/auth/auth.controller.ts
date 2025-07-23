import { Request, Response } from "express";
import { IUser } from "./auth.interface";
import { AuthService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const userInfo: IUser = req.body;

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
  const userInfo: IUser = req.body;

  const { accessToken, refreshToken, user } = await AuthService.login(userInfo);
  res.cookie("refreshToken", refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully",
    data: { accessToken, user },
  });
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  console.log("refreshToken--------------\n [refresh()]", req.cookies);
  const { refreshToken } = req.cookies;
  const { accessToken, newRefreshToken } = await AuthService.refreshToken(refreshToken);
  res.cookie("refreshToken", newRefreshToken);

  console.log("accessToken", accessToken);
  console.log("newRefreshToken", newRefreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New access token generated successfully",
    data: { accessToken },
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
    message: "User fatched in successfully",
    data: user,
  });
};

export const AuthController = {
  registerUser,
  login,
  refreshToken,
  getSingleUserData,
};
