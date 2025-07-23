import ApiError from "../../../errors/ApiError";
import { IBus } from "./bus.interface";
import { BusModel } from "./bus.model";

const getBuses = async (): Promise<IBus[]> => {
  return await BusModel.find().populate("assignedRouteId assignedDriverId");
};

const createBus = async (busInfo: IBus): Promise<IBus> => {
  const bus = await BusModel.create(busInfo);
  return bus;
};

const updateBus = async (busId: string, busInfo: Partial<IBus>): Promise<IBus> => {
  const updatedBus = await BusModel.findByIdAndUpdate(busId, { $set: busInfo }, { new: true });

  if (!updatedBus) {
    throw ApiError.notFound("Bus not found");
  }

  return updatedBus;
};

const deleteBus = async (busId: string): Promise<IBus> => {
  const deletedBus = await BusModel.findByIdAndDelete(busId);
  if (!deletedBus) {
    throw ApiError.notFound("Bus not found");
  }

  return deletedBus;
};

export const BusService = {
  createBus,
  getBuses,
  updateBus,
  deleteBus,
};
