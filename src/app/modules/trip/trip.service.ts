import { ITrip } from "./trip.interface";
import { TripModel } from "./trip.model";



const create = async (tripData: ITrip) => {
  const trip = await TripModel.create(tripData);
  return trip;
};

export const TripService = {
    create
}