import { create } from "./../trip/trip.validation";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import jwt, { Secret } from "jsonwebtoken";
import config from "../../../config";
import mongoose, { Types } from "mongoose";
import { IUser } from "./auth.interface";
import { AdminModel, CustomerModel, POSDeviceModel, UserModel } from "./auth.model";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_LIFE } = config.JWT;

const generateToken = (data: any, secret: Secret, expiration: any) => {
  return jwt.sign(data, secret, { expiresIn: expiration });
};

const registerUser = async (userInfo: IUser) => {
  const { role, email } = userInfo;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) throw ApiError.badRequest("User already exists");

  let newUser;
  if (userInfo.role === "customer") newUser = await CustomerModel.create(userInfo);
  else if (userInfo.role === "pos_device") newUser = await POSDeviceModel.create(userInfo);
  else if (userInfo.role === "admin") newUser = await AdminModel.create(userInfo);

  if (!newUser) throw ApiError.internal("Failed to create user");

  const accessToken = generateToken({ userId: newUser._id, email, role }, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE);
  const refreshToken = generateToken({ userId: newUser._id, email, role }, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE);

  return { accessToken, refreshToken, user: newUser };
};

const login = async (userInfo: { email: string; password: string }) => {
  const { email, password } = userInfo;
  const user = await UserModel.findOne({ email });
  if (!user) throw ApiError.notFound("User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw ApiError.unauthorized("Invalid password");

  const { _id, role } = user;

  const accessToken = generateToken({ userId: _id, email, role }, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE);
  const refreshToken = generateToken({ userId: _id, email, role }, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE);

  return { accessToken, refreshToken, user: user };
};

// const refreshToken = async (token: string) => {
//   if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
//     throw new Error("JWT secrets are not defined in the configuration");
//   }

//   let decoded;
//   console.log("Decoded token", token);
//   try {
//     decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
//       _id: string;
//       email: string;
//       role: string;
//     };
//   } catch (err) {
//     // Token expired or invalid
//     throw ApiError.unauthorized("INVALID_REFRESH_TOKEN");
//   }
//   console.log(new Date(decoded.iat * 1000).toLocaleString());
//   // Example output: "Mon, 21 Feb 2025 11:45:53 GMT"

//   console.log(new Date(decoded.exp * 1000).toLocaleString());
//   console.log("Decoded token", decoded);
//   const user = await UserModel.findById(decoded._id).populate("routeId");
//   if (!user) throw ApiError.notFound("User not found");

//   const { _id, email, role } = user;

//   const accessToken = generateToken(
//     { _id: _id as Types.ObjectId, email, role },
//     ACCESS_TOKEN_SECRET,
//     ACCESS_TOKEN_LIFE
//   );
//   const newRefreshToken = generateToken(
//     { _id: _id as Types.ObjectId, email, role },
//     REFRESH_TOKEN_SECRET,
//     REFRESH_TOKEN_LIFE
//   );

//   return { accessToken, newRefreshToken };
// };

const getSingleUserData = async (userId: string) => {
  console.log(userId);
  const user = await UserModel.findById(userId);
  console.log(user);
  if (!user) throw ApiError.notFound("User not found");

  return user;
};

export const AuthService = { registerUser, login, getSingleUserData };
