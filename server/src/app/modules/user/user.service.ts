import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";
import { PassengerModel, POSDeviceModel, AdminModel, SuperAdminModel } from "../auth/auth.model";
import { IPassenger, IPosDevice, IAdmin, ISuperAdmin } from "../auth/auth.interface";
import { CardModel } from "../card/card.model";

// -------------------------------------------------------------------------
// Passenger CRUD
// -------------------------------------------------------------------------
const createPassenger = async (payload: IPassenger) => {
  const existing = await PassengerModel.findOne({ phoneNumber: payload.phoneNumber });
  if (existing) throw ApiError.badRequest("Passenger with this phone number already exists");

  const existingNfc = await PassengerModel.findOne({ nfcUid: payload.nfcUid });
  if (existingNfc) throw ApiError.badRequest("Passenger with this NFC UID already exists");

  const result = await PassengerModel.create(payload);
  return result;
};

const getAllPassengers = async () => {
  return await CardModel.find({ userId: { $ne: null } })
    .populate({
      path: "userId",
      populate: { path: "route" },
    });
};

const getPassengerById = async (id: string) => {
  const result = await PassengerModel.findById(id).populate("route").lean();
  if (!result) throw ApiError.notFound("Passenger not found");

  const card = await CardModel.findOne({ userId: id }).lean();

  return {
    ...result,
    card: card
      ? {
          _id: card._id,
          nfcUid: card.nfcUid,
          balance: card.balance,
          status: card.status,
          lastUsedAt: card.lastUsedAt,
        }
      : null,
  };
};

const updatePassenger = async (id: string, payload: Partial<IPassenger>) => {
  const doc = await PassengerModel.findById(id);
  if (!doc) throw ApiError.notFound("Passenger not found");

  if (payload.phoneNumber && payload.phoneNumber !== doc.phoneNumber) {
    const existing = await PassengerModel.findOne({ phoneNumber: payload.phoneNumber });
    if (existing) throw ApiError.badRequest("Passenger with this phone number already exists");
  }

  if (payload.nfcUid && payload.nfcUid !== doc.nfcUid) {
    const existingNfc = await PassengerModel.findOne({ nfcUid: payload.nfcUid });
    if (existingNfc) throw ApiError.badRequest("Passenger with this NFC UID already exists");
  }

  if (payload.pin) {
    payload.pin = await bcrypt.hash(payload.pin, Number(config.BCRYPT_SALT_ROUNDS));
  }

  Object.assign(doc, payload);
  await doc.save();
  return doc;
};

const deletePassenger = async (id: string) => {
  const result = await PassengerModel.findByIdAndDelete(id);
  if (!result) throw ApiError.notFound("Passenger not found");
  return result;
};

// -------------------------------------------------------------------------
// POSDevice CRUD
// -------------------------------------------------------------------------
const createPOSDevice = async (payload: IPosDevice) => {
  const existing = await POSDeviceModel.findOne({ phoneNumber: payload.phoneNumber });
  if (existing) throw ApiError.badRequest("POS Device with this phone number already exists");

  const existingDevice = await POSDeviceModel.findOne({ deviceId: payload.deviceId });
  if (existingDevice) throw ApiError.badRequest("POS Device with this Device ID already exists");

  if (payload.assignedBus) {
    const busAlreadyAssigned = await POSDeviceModel.findOne({ assignedBus: payload.assignedBus });
    if (busAlreadyAssigned) throw ApiError.badRequest("This bus is already assigned to another POS device");
  }

  const result = await POSDeviceModel.create(payload);
  return result;
};

const getAllPOSDevices = async () => {
  return await POSDeviceModel.find({}).populate("assignedBus assignedRoute");
};

const getPOSDeviceById = async (id: string) => {
  const result = await POSDeviceModel.findById(id).populate("assignedBus assignedRoute");
  if (!result) throw ApiError.notFound("POS Device not found");
  return result;
};

const updatePOSDevice = async (id: string, payload: Partial<IPosDevice>) => {
  const doc = await POSDeviceModel.findById(id);
  if (!doc) throw ApiError.notFound("POS Device not found");

  if (payload.phoneNumber && payload.phoneNumber !== doc.phoneNumber) {
    const existing = await POSDeviceModel.findOne({ phoneNumber: payload.phoneNumber });
    if (existing) throw ApiError.badRequest("POS Device with this phone number already exists");
  }

  if (payload.deviceId && payload.deviceId !== doc.deviceId) {
    const existingDevice = await POSDeviceModel.findOne({ deviceId: payload.deviceId });
    if (existingDevice) throw ApiError.badRequest("POS Device with this Device ID already exists");
  }

  if (payload.assignedBus) {
    const busAlreadyAssigned = await POSDeviceModel.findOne({
      assignedBus: payload.assignedBus,
      _id: { $ne: id },
    });
    if (busAlreadyAssigned) throw ApiError.badRequest("This bus is already assigned to another POS device");
  }

  if (payload.pin) {
    payload.pin = await bcrypt.hash(payload.pin, Number(config.BCRYPT_SALT_ROUNDS));
  }

  Object.assign(doc, payload);
  await doc.save();
  return doc;
};

const deletePOSDevice = async (id: string) => {
  const result = await POSDeviceModel.findByIdAndDelete(id);
  if (!result) throw ApiError.notFound("POS Device not found");
  return result;
};

// -------------------------------------------------------------------------
// Admin CRUD
// -------------------------------------------------------------------------
const createAdmin = async (payload: IAdmin) => {
  const existing = await AdminModel.findOne({ email: payload.email });
  if (existing) throw ApiError.badRequest("Admin with this email already exists");

  const result = await AdminModel.create(payload);
  return result;
};

const getAllAdmins = async () => {
  return await AdminModel.find({});
};

const getAdminById = async (id: string) => {
  const result = await AdminModel.findById(id);
  if (!result) throw ApiError.notFound("Admin not found");
  return result;
};

const updateAdmin = async (id: string, payload: Partial<IAdmin>) => {
  const doc = await AdminModel.findById(id);
  if (!doc) throw ApiError.notFound("Admin not found");

  if (payload.email && payload.email !== doc.email) {
    const existing = await AdminModel.findOne({ email: payload.email });
    if (existing) throw ApiError.badRequest("Admin with this email already exists");
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, Number(config.BCRYPT_SALT_ROUNDS));
  }

  Object.assign(doc, payload);
  await doc.save();
  return doc;
};

const deleteAdmin = async (id: string) => {
  const result = await AdminModel.findByIdAndDelete(id);
  if (!result) throw ApiError.notFound("Admin not found");
  return result;
};

// -------------------------------------------------------------------------
// Super Admin CRUD
// -------------------------------------------------------------------------
const createSuperAdmin = async (payload: ISuperAdmin) => {
  const existing = await SuperAdminModel.findOne({ email: payload.email });
  if (existing) throw ApiError.badRequest("Super Admin with this email already exists");

  const result = await SuperAdminModel.create(payload);
  return result;
};

const getAllSuperAdmins = async () => {
  return await SuperAdminModel.find({});
};

const getSuperAdminById = async (id: string) => {
  const result = await SuperAdminModel.findById(id);
  if (!result) throw ApiError.notFound("Super Admin not found");
  return result;
};

const updateSuperAdmin = async (id: string, payload: Partial<ISuperAdmin>) => {
  const doc = await SuperAdminModel.findById(id);
  if (!doc) throw ApiError.notFound("Super Admin not found");

  if (payload.email && payload.email !== doc.email) {
    const existing = await SuperAdminModel.findOne({ email: payload.email });
    if (existing) throw ApiError.badRequest("Super Admin with this email already exists");
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, Number(config.BCRYPT_SALT_ROUNDS));
  }

  Object.assign(doc, payload);
  await doc.save();
  return doc;
};

const deleteSuperAdmin = async (id: string) => {
  const result = await SuperAdminModel.findByIdAndDelete(id);
  if (!result) throw ApiError.notFound("Super Admin not found");
  return result;
};

export const UserService = {
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
