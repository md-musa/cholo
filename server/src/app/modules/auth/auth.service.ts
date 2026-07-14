import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import jwt, { Secret } from "jsonwebtoken";
import config from "../../../config";
import { AdminModel, PassengerModel, POSDeviceModel, SuperAdminModel } from "./auth.model";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_LIFE } = config.JWT;

const generateToken = (data: any, secret: Secret, expiration: any) => {
  return jwt.sign(data, secret, { expiresIn: expiration });
};

const registerUser = async (userInfo: any) => {
  const { role, email, phoneNumber } = userInfo;

  // Check unique constraints before creating
  if (email) {
    const existingAdmin = await AdminModel.findOne({ email });
    const existingSuperAdmin = await SuperAdminModel.findOne({ email });
    if (existingAdmin || existingSuperAdmin) {
      throw ApiError.badRequest("User with this email already exists");
    }
  }

  if (phoneNumber) {
    const existingPassenger = await PassengerModel.findOne({ phoneNumber });
    const existingPOS = await POSDeviceModel.findOne({ phoneNumber });
    if (existingPassenger || existingPOS) {
      throw ApiError.badRequest("User with this phone number already exists");
    }
  }

  // Check nfcUid for Passenger
  if (role === "passenger" && userInfo.nfcUid) {
    const existingPassenger = await PassengerModel.findOne({ nfcUid: userInfo.nfcUid });
    if (existingPassenger) {
      throw ApiError.badRequest("Passenger with this NFC UID already exists");
    }
  }

  // Check deviceId for POS Device
  if (role === "pos_device" && userInfo.deviceId) {
    const existingPOS = await POSDeviceModel.findOne({ deviceId: userInfo.deviceId });
    if (existingPOS) {
      throw ApiError.badRequest("POS Device with this Device ID already exists");
    }
  }

  let newUser: any;
  if (role === "passenger") {
    newUser = await PassengerModel.create(userInfo);
  } else if (role === "pos_device") {
    newUser = await POSDeviceModel.create(userInfo);
  } else if (role === "admin") {
    newUser = await AdminModel.create(userInfo);
  } else if (role === "super_admin") {
    newUser = await SuperAdminModel.create(userInfo);
  } else {
    throw ApiError.badRequest("Invalid role");
  }

  if (!newUser) throw ApiError.internal("Failed to create user");

  const tokenPayload: any = { userId: newUser._id, role: newUser.role };
  if (newUser.email) tokenPayload.email = newUser.email;
  if (newUser.phoneNumber) tokenPayload.phoneNumber = newUser.phoneNumber;

  const accessToken = generateToken(tokenPayload, ACCESS_TOKEN_SECRET as Secret, ACCESS_TOKEN_LIFE);
  const refreshToken = generateToken(tokenPayload, REFRESH_TOKEN_SECRET as Secret, REFRESH_TOKEN_LIFE);

  return { accessToken, refreshToken, user: newUser };
};

const login = async (userInfo: any) => {
  const { role, email, password, phoneNumber, pin } = userInfo;

  let user: any = null;
  let isCredentialsValid = false;

  if (email && password) {
    if (role === "super_admin") {
      user = await SuperAdminModel.findOne({ email });
    } else if (role === "admin") {
      user = await AdminModel.findOne({ email });
    } else {
      user = await AdminModel.findOne({ email });
      if (!user) {
        user = await SuperAdminModel.findOne({ email });
      }
    }

    if (!user) throw ApiError.notFound("User not found");
    isCredentialsValid = await bcrypt.compare(password, user.password);
    if (!isCredentialsValid) throw ApiError.unauthorized("Invalid password");

  } else if (phoneNumber && pin) {

    if (role === "passenger") {
      user = await PassengerModel.findOne({ phoneNumber });
    } else if (role === "pos_device") {
      user = await POSDeviceModel.findOne({ phoneNumber });
    } else {
      user = await PassengerModel.findOne({ phoneNumber });
      if (!user) {
        user = await POSDeviceModel.findOne({ phoneNumber });
      }
    }

    if (!user) throw ApiError.notFound("User not found");
    isCredentialsValid = await bcrypt.compare(pin, user.pin);
    if (!isCredentialsValid) throw ApiError.unauthorized("Invalid PIN");
  } else {
    throw ApiError.badRequest("Invalid login request. Provide email/password or phoneNumber/pin.");
  }

  const { _id, role: userRole } = user;
  const tokenPayload: any = { userId: _id, role: userRole };
  if (user.email) tokenPayload.email = user.email;
  if (user.phoneNumber) tokenPayload.phoneNumber = user.phoneNumber;

  const accessToken = generateToken(tokenPayload, ACCESS_TOKEN_SECRET as Secret, ACCESS_TOKEN_LIFE);
  const refreshToken = generateToken(tokenPayload, REFRESH_TOKEN_SECRET as Secret, REFRESH_TOKEN_LIFE);

  return { accessToken, refreshToken, user };
};

const getSingleUserData = async (userId: string) => {
  console.log("Fetching user for ID:", userId);
  let user: any = await PassengerModel.findById(userId);
  if (!user) user = await POSDeviceModel.findById(userId);
  if (!user) user = await AdminModel.findById(userId);
  if (!user) user = await SuperAdminModel.findById(userId);

  if (!user) throw ApiError.notFound("User not found");

  return user;
};

const refreshToken = async (token: string) => {
  if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in the configuration");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, REFRESH_TOKEN_SECRET as Secret);
  } catch (err) {
    throw ApiError.unauthorized("INVALID_REFRESH_TOKEN");
  }

  const { userId } = decoded;
  let user: any = await PassengerModel.findById(userId);
  if (!user) user = await POSDeviceModel.findById(userId);
  if (!user) user = await AdminModel.findById(userId);
  if (!user) user = await SuperAdminModel.findById(userId);

  if (!user) throw ApiError.notFound("User not found");

  const tokenPayload: any = { userId: user._id, role: user.role };
  if (user.email) tokenPayload.email = user.email;
  if (user.phoneNumber) tokenPayload.phoneNumber = user.phoneNumber;

  const accessToken = generateToken(tokenPayload, ACCESS_TOKEN_SECRET as Secret, ACCESS_TOKEN_LIFE);
  const newRefreshToken = generateToken(tokenPayload, REFRESH_TOKEN_SECRET as Secret, REFRESH_TOKEN_LIFE);

  return { accessToken, refreshToken: newRefreshToken };
};

export const AuthService = { registerUser, login, getSingleUserData, refreshToken };


