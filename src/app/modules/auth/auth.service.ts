import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import { IUser } from "./auth.interface";
import jwt, { Secret } from "jsonwebtoken";
import UserModel from "./auth.model";
import config from "../../../config";
import mongoose, { Types } from "mongoose";

const userId: Types.ObjectId = new mongoose.Types.ObjectId();

// Helper function to generate JWT tokens
const generateToken = (data: Partial<IUser> & { _id: Types.ObjectId }, secret: Secret, expiration: any) => {
  return jwt.sign({ ...data, _id: data._id.toString() }, secret, { expiresIn: expiration });
};

const registerUser = async (userInfo: IUser) => {
  const existingUser = await UserModel.findOne({ email: userInfo.email });
  if (existingUser) throw ApiError.badRequest("User already exists");

  // Create new user
  const user = await (await UserModel.create(userInfo)).populate("routeId");
  const { _id, name, email, role, phoneNumber, routeId } = user;

  const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE } = config.JWT;

  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in the configuration");
  }

  // Generate tokens
  if (!ACCESS_TOKEN_LIFE || !REFRESH_TOKEN_LIFE) {
    throw new Error("JWT token lifetimes are not defined in the configuration");
  }

  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in the configuration");
  }

  const accessToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE
  );
  const refreshToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFE
  );

  return { accessToken, refreshToken, user: { _id, name, email, role, phoneNumber, routeId } };
};

const login = async (userInfo: { email: string; password: string }) => {
  const user = await UserModel.findOne({ email: userInfo.email }).populate("routeId");
  if (!user) throw ApiError.notFound("User not found");

  const isPasswordValid = await bcrypt.compare(userInfo.password, user.password);
  if (!isPasswordValid) throw ApiError.unauthorized("Invalid password");

  const { _id, name, email, role, phoneNumber, routeId } = user;

  const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE } = config.JWT;

  // Generate tokens
  // Generate tokens
  if (!ACCESS_TOKEN_LIFE || !REFRESH_TOKEN_LIFE) {
    throw new Error("JWT token lifetimes are not defined in the configuration");
  }

  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in the configuration");
  }
  const accessToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE
  );
  const refreshToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFE
  );

  return { accessToken, refreshToken, user: { _id, name, email, role, phoneNumber, routeId } };
};

const refreshToken = async (token: string) => {
  const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_LIFE } = config.JWT;

  if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in the configuration");
  }

  let decoded;
  console.log("Decoded token", token);
  try {
    decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      _id: string;
      email: string;
      role: string;
    };
  } catch (err) {
    // Token expired or invalid
    throw ApiError.unauthorized("INVALID_REFRESH_TOKEN");
  }
  console.log(new Date(decoded.iat * 1000).toLocaleString());
  // Example output: "Mon, 21 Feb 2025 11:45:53 GMT"

  console.log(new Date(decoded.exp * 1000).toLocaleString());
  console.log("Decoded token", decoded);
  const user = await UserModel.findById(decoded._id).populate("routeId");
  if (!user) throw ApiError.notFound("User not found");

  const { _id, email, role } = user;

  const accessToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE
  );
  const newRefreshToken = generateToken(
    { _id: _id as Types.ObjectId, email, role },
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFE
  );

  return { accessToken, newRefreshToken };
};

const getSingleUserData = async (userId: string) => {
  console.log(userId)
  const user = await UserModel.findById(userId);
  console.log(user);
  if (!user) throw ApiError.notFound("User not found");

  return user;
};

export const AuthService = { registerUser, login, getSingleUserData, refreshToken };
